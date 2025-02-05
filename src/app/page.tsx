'use client';

import { loadMetadata, Dubhe, Transaction, TransactionResult } from '@0xobelisk/sui-client';
import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { Value } from '@/app/state';
import { SCHEMA_ID, NETWORK, PACKAGE_ID } from '@/chain/config';
import { PRIVATEKEY } from '@/chain/key';
import { toast } from 'sonner';

export default function Home() {
  const [value, setValue] = useAtom(Value);
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<WebSocket | null>(null);

  /**
   * Fetches the current value of the counter contract
   */
  const queryCounterValue = async () => {
    const metadata = await loadMetadata(NETWORK, PACKAGE_ID);
    const dubhe = new Dubhe({
      networkType: NETWORK,
      packageId: PACKAGE_ID,
      metadata: metadata,
    });
    const counterStorage = await dubhe.getStorageItem({
      name: 'value',
    });
    console.log('counter Storage ', counterStorage);
    setValue(counterStorage.value);
  };

  /**
   * Increments the counter value
   */
  const incrementCounter = async () => {
    setLoading(true);
    const metadata = await loadMetadata(NETWORK, PACKAGE_ID);
    const dubhe = new Dubhe({
      networkType: NETWORK,
      packageId: PACKAGE_ID,
      metadata: metadata,
      secretKey: PRIVATEKEY,
    });
    const tx = new Transaction();
    (await dubhe.tx.counter_system.inc({
      tx,
      params: [tx.object(SCHEMA_ID), tx.pure.u32(1)],
      isRaw: true,
    })) as TransactionResult;
    await dubhe.signAndSendTxn({
      tx,
      onSuccess: async result => {
        setTimeout(async () => {
          await queryCounterValue();
          toast('Transaction Successful', {
            description: new Date().toUTCString(),
            action: {
              label: 'Check in Explorer',
              onClick: () => window.open(dubhe.getTxExplorerUrl(result.digest), '_blank'),
            },
          });
        }, 200);

        // await dubhe.waitForTransaction(result.digest);
      },
      onError: error => {
        console.error('Transaction failed:', error);
        toast.error('Transaction failed. Please try again.');
      },
    });

    setLoading(false);
  };

  const subscribeToCounter = async (dubhe: Dubhe) => {
    try {
      const sub = await dubhe.subscribe(['value'], data => {
        console.log('Received increment event:', data);
        // Update counter value after receiving event
        setValue(data.value);
        toast('Counter Updated', {
          description: `New value has been updated`,
        });
      });
      setSubscription(sub);
    } catch (error) {
      console.error('Failed to subscribe to events:', error);
    }
  };

  useEffect(() => {
    const initSubscription = async () => {
      const metadata = await loadMetadata(NETWORK, PACKAGE_ID);
      const dubhe = new Dubhe({
        networkType: NETWORK,
          packageId: PACKAGE_ID,
          metadata: metadata,
        });
      await subscribeToCounter(dubhe);
      await queryCounterValue();
    };

    initSubscription();

    return () => {
      if (subscription) {
        subscription.close();
      }
    };
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="max-w-7xl mx-auto text-center py-12 px-4 sm:px-6 lg:py-16 lg:px-8 flex-6">
          <div className="flex flex-col gap-6 mt-12">
            <div className="flex flex-col gap-4">
              You account already have some sui from {NETWORK}
              <div className="flex flex-col gap-6 text-2xl text-green-600 mt-6 ">Counter: {value}</div>
              <div className="flex flex-col gap-6">
                <button
                  type="button"
                  className="mx-auto px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => incrementCounter()}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Increment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import {
  loadMetadata,
  Dubhe,
  Transaction,
  TransactionResult,
  DevInspectResults,
  NetworkType,
} from '@0xobelisk/sui-client';
import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { Value } from '../../jotai';
import { useRouter } from 'next/router';
import { SCHEMA_ID, NETWORK, PACKAGE_ID } from '../../chain/config';
import { PRIVATEKEY } from '../../chain/key';
import { toast } from 'sonner';

const Home = () => {
  const router = useRouter();
  const [value, setValue] = useAtom(Value);
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<WebSocket | null>(null);

  const query_counter_value = async () => {
    const metadata = await loadMetadata(NETWORK, PACKAGE_ID);
    const dubhe = new Dubhe({
      networkType: NETWORK,
      packageId: PACKAGE_ID,
      metadata: metadata,
    });
    const counterStorage = await dubhe.getStorageItem({
      name: 'counter',
    });
    console.log('counter Storage ', counterStorage);
    setValue(counterStorage.value);
  };

  const counter = async () => {
    setLoading(true);
    try {
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
      const response = await dubhe.signAndSendTxn(tx);
      if (response.effects.status.status == 'success') {
        setTimeout(async () => {
          console.log(response);
          console.log(response.digest);
          toast('Transfer Successful', {
            description: new Date().toUTCString(),
            action: {
              label: 'Check in Explorer',
              onClick: () => window.open(dubhe.getTxExplorerUrl(response.digest), '_blank'),
            },
          });
          setLoading(false);
        }, 200);
      }
    } catch (error) {
      toast.error('Transaction failed. Please try again.');
      setLoading(false);
      console.error(error);
    }
  };

  const subscribeToCounter = async (dubhe: Dubhe) => {
    try {
      const sub = await dubhe.subscribe(['counter'], data => {
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
      if (router.isReady) {
        const metadata = await loadMetadata(NETWORK, PACKAGE_ID);
        const dubhe = new Dubhe({
          networkType: NETWORK,
          packageId: PACKAGE_ID,
          metadata: metadata,
        });
        await subscribeToCounter(dubhe);
        await query_counter_value();
      }
    };

    initSubscription();

    // 清理函数
    return () => {
      if (subscription) {
        subscription.close();
      }
    };
  }, [router.isReady]);

  return (
    <div className="max-w-7xl mx-auto text-center py-12 px-4 sm:px-6 lg:py-16 lg:px-8 flex-6">
      <div className="flex flex-col gap-6 mt-12">
        <div className="flex flex-col gap-4">
          You account already have some sui from {NETWORK}
          <div className="flex flex-col gap-6 text-2xl text-green-600 mt-6 ">Counter: {value}</div>
          <div className="flex flex-col gap-6">
            <button
              type="button"
              className="mx-auto px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              onClick={() => counter()}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Increment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

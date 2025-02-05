#[test_only]
module counter::counter_test {
    use sui::test_scenario;
    use counter::counter_system;
    use counter::init_test;
    use counter::schema::Schema;

    #[test]
    public fun inc() {
        let (scenario, dapp)  = init_test::deploy_dapp_for_testing(@0xA);

        let mut schema = test_scenario::take_shared<Schema>(&scenario);

        assert!(schema.value().get() == 0);

        counter_system::inc(&mut schema, 10);
        assert!(schema.value().get() == 10);

        counter_system::inc(&mut schema, 10);
        assert!(schema.value().get() == 20);

        test_scenario::return_shared(schema);
        dapp.distroy_dapp_for_testing();
        scenario.end();
    }
}

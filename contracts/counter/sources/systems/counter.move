module counter::counter_system {
    use counter::schema::Schema;
    use counter::events::increment_event;
    use counter::errors::invalid_increment_error;

    public entry fun inc(scheam: &mut Schema, number: u32) {
        // Check if the increment value is valid.
        invalid_increment_error(number > 0 && number < 100);
        let value = scheam.value()[];
        scheam.value().set(value + number);
        increment_event(number);
    }

    public fun get(scheam: &Schema): u32 {
        scheam.borrow_value()[]
    }
}
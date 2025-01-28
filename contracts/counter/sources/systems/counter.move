module counter::counter_system {
    use counter::schema::Schema;
    use counter::errors;
    use counter::events;

    public entry fun inc(schema: &mut Schema, number: u32) {
        errors::invalid_increment_error(number > 0 && number < 100);
        let counter = get(schema);
        schema.counter().set(counter + number);
        events::increment_event(number);

    }

    public fun get(schema: &Schema) : u32 {
        *schema.borrow_counter().get()
    }
}
  // Copyright (c) Obelisk Labs, Inc.
  // SPDX-License-Identifier: Apache-2.0
  #[allow(unused_use)]
  
  /* Autogenerated file. Do not edit manually. */
  
  module counter::events {

  use std::ascii::{String, string};

  use counter::increment_event::IncrementEvent;

  use counter::increment_event;

  public fun increment_event(value: u32) {
    dubhe::storage_event::emit_set_record<IncrementEvent, IncrementEvent, IncrementEvent>(
				string(b"increment_event"),
				option::none(),
			  	option::none(),
			  option::some(increment_event::new(value))
			  )
  }
}

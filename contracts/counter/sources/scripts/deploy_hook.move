  // Copyright (c) Obelisk Labs, Inc.
  // SPDX-License-Identifier: Apache-2.0
  #[allow(unused_use)]
  
  /* Autogenerated file. Do not edit manually. */
  
  module counter::deploy_hook {

  use counter::schema::Schema;

  public(package) fun run(_schema: &mut Schema, _ctx: &mut TxContext) {
    _schema.value().set(0);
  }
}

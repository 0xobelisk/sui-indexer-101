#[allow(lint(share_owned), unused_let_mut)]module counter::deploy_hook {

  use std::ascii::string;


  use counter::schema::Schema;

  public entry fun run(schema: &mut Schema, ctx: &mut TxContext) {
      			schema.counter().set(0);
  }
}

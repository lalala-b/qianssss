function initMethod(state: unknown) {
  console.warn("state----", state);
}
class Actions {
  actions = {
    onGlobalStateChange: initMethod,
    setGlobalState: initMethod,
  };

  setActions(actions: unknown) {
    //   this.actions = actions;
    console.info("--1-----", this.actions, actions);
  }

  onGlobalStateChange(...args: any) {
    return this.actions.onGlobalStateChange({...args});
  }

  setGlobalState(...args: unknown[]) {
    return this.actions.setGlobalState({...args});
  }
}
const actions = new Actions();
export default actions;

import { getQuickJS } from 'quickjs-emscripten';

// Learner code runs inside the VM, never in the browser's JavaScript realm.
self.onmessage = async (event: MessageEvent<string>) => {
  if (typeof event.data !== 'string' || event.data.length > 16000) return;
  const output: string[] = [];
  let error: string | undefined;
  try {
    const engine = await getQuickJS();
    const runtime = engine.newRuntime();
    runtime.setMemoryLimit(16 * 1024 * 1024);
    runtime.setMaxStackSize(256 * 1024);
    const deadline = Date.now() + 1000;
    runtime.setInterruptHandler(() => Date.now() > deadline);
    const vm = runtime.newContext();
    try {
      const log = vm.newFunction('log', (...args) => {
        if (output.length >= 50) throw new Error('Output limit reached (50 lines).');
        const line = args
          .map((value) => {
            const type = vm.typeof(value);
            if (type === 'string') return vm.getString(value).slice(0, 1000);
            if (type === 'number') return String(vm.getNumber(value));
            if (type === 'undefined') return 'undefined';
            // Avoid serializing arbitrary objects or invoking learner-defined getters.
            if (type === 'boolean') return String(vm.dump(value));
            if (vm.eq(value, vm.null)) return 'null';
            return '[' + type + ']';
          })
          .join(' ')
          .slice(0, 1000);
        output.push(line);
      });
      const consoleObject = vm.newObject();
      vm.setProp(consoleObject, 'log', log);
      vm.setProp(vm.global, 'console', consoleObject);
      log.dispose();
      consoleObject.dispose();
      const result = vm.evalCode(event.data, 'exercise.js');
      if (result.error) {
        const message = vm.getProp(result.error, 'message');
        error =
          vm.typeof(message) === 'string'
            ? vm.getString(message).slice(0, 1000)
            : 'Execution failed.';
        message.dispose();
        result.error.dispose();
      } else result.value.dispose();
    } finally {
      vm.dispose();
      runtime.dispose();
    }
  } catch {
    error = 'The runner could not finish. Try a smaller program.';
  }
  self.postMessage({ output, error });
};

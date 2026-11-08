import { getQuickJS } from 'quickjs-emscripten';

// Learner code runs inside the VM, never in the browser's JavaScript realm.
self.onmessage = async (event: MessageEvent<string>) => {
  const request =
    typeof event.data === 'string'
      ? { code: event.data, checks: [] }
      : (event.data as unknown as {
          code: string;
          checks: Array<{ expression: string; expected: number }>;
        });
  if (
    !request ||
    typeof request.code !== 'string' ||
    request.code.length > 16000 ||
    !Array.isArray(request.checks) ||
    request.checks.length > 20 ||
    request.checks.some(
      (check) =>
        !check ||
        typeof check.expression !== 'string' ||
        check.expression.length > 2000 ||
        typeof check.expected !== 'number',
    )
  )
    return;
  const output: string[] = [];
  const checks: Array<{ passed: boolean; actual: string }> = [];
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
      const result = vm.evalCode(request.code, 'exercise.js');
      if (result.error) {
        const message = vm.getProp(result.error, 'message');
        error =
          vm.typeof(message) === 'string'
            ? vm.getString(message).slice(0, 1000)
            : 'Execution failed.';
        message.dispose();
        result.error.dispose();
      } else {
        result.value.dispose();
        for (const check of request.checks) {
          const evaluated = vm.evalCode(check.expression, 'check.js');
          if (evaluated.error) {
            checks.push({ passed: false, actual: 'Execution error' });
            evaluated.error.dispose();
          } else {
            const numeric = vm.typeof(evaluated.value) === 'number';
            const value = numeric ? vm.getNumber(evaluated.value) : undefined;
            checks.push({
              passed: numeric && value === check.expected,
              actual: numeric ? String(value) : 'Not a number',
            });
            evaluated.value.dispose();
          }
        }
      }
    } finally {
      vm.dispose();
      runtime.dispose();
    }
  } catch {
    error = 'The runner could not finish. Try a smaller program.';
  }
  self.postMessage({ output, error, checks });
};

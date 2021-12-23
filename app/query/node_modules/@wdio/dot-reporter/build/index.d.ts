import WDIOReporter from '@wdio/reporter';
import type { Reporters } from '@wdio/types';
/**
 * Initialize a new `Dot` matrix test reporter.
 */
export default class DotReporter extends WDIOReporter {
    constructor(options: Reporters.Options);
    /**
     * pending tests
     */
    onTestSkip(): void;
    /**
     * passing tests
     */
    onTestPass(): void;
    /**
     * failing tests
     */
    onTestFail(): void;
}
//# sourceMappingURL=index.d.ts.map
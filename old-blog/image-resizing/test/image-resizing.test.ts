import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import ImageResizing = require('../lib/image-resizing-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new ImageResizing.ImageResizingStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
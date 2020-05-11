#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { ImageResizingStack } from '../lib/image-resizing-stack';

const app = new cdk.App();
new ImageResizingStack(app, 'BrightInventionsPlImageResizingStack');

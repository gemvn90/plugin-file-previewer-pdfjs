/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React from 'react';
import { Plugin } from '@nocobase/client';
import { PDFPreviewer } from './PDFPreviewer';
import { attachmentFileTypes } from '@nocobase/client';
import { NAMESPACE } from './locale';

export class PluginFilePreviewerPdfjsClient extends Plugin {
  async afterAdd() {
    // Register locale resources
    this.app.i18n.addResources('en-US', NAMESPACE, {
      'Page': 'Page',
      'of': 'of',
      'Download': 'Download',
      'Close': 'Close',
      'Previous': 'Previous',
      'Next': 'Next',
      'Loading PDF...': 'Loading PDF...',
      'Failed to load PDF:': 'Failed to load PDF:'
    });
    
    this.app.i18n.addResources('zh-CN', NAMESPACE, {
      'Page': '页',
      'of': '共',
      'Download': '下载',
      'Close': '关闭',
      'Previous': '上一页',
      'Next': '下一页',
      'Loading PDF...': '正在加载 PDF...',
      'Failed to load PDF:': '加载 PDF 失败：'
    });
  }

  async load() {
    attachmentFileTypes.add({
      match(file) {
        if (file.mimetype === 'application/pdf') return true;
        if (file.extname?.toLowerCase() === 'pdf') return true;
        return false;
      },
      Previewer: PDFPreviewer,
    });
  }
}

export default PluginFilePreviewerPdfjsClient;

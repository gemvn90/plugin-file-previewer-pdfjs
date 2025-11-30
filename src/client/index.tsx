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
      'Previous page': 'Previous page',
      'Next page': 'Next page',
      'Zoom in': 'Zoom in',
      'Zoom out': 'Zoom out',
      'Rotate left': 'Rotate left',
      'Rotate right': 'Rotate right',
      'Fit to width': 'Fit to width',
      'Fit to page': 'Fit to page',
      'Search in document': 'Search in document',
      'Search text...': 'Search text...',
      'Previous match': 'Previous match',
      'Next match': 'Next match',
      'Loading PDF...': 'Loading PDF...',
      'Loading PDF worker...': 'Loading PDF worker...',
      'Failed to load PDF:': 'Failed to load PDF:'
    });
    
    this.app.i18n.addResources('zh-CN', NAMESPACE, {
      'Page': '页',
      'of': '共',
      'Download': '下载',
      'Close': '关闭',
      'Previous': '上一页',
      'Next': '下一页',
      'Previous page': '上一页',
      'Next page': '下一页',
      'Zoom in': '放大',
      'Zoom out': '缩小',
      'Rotate left': '向左旋转',
      'Rotate right': '向右旋转',
      'Fit to width': '适合宽度',
      'Fit to page': '适合页面',
      'Search in document': '在文档中搜索',
      'Search text...': '搜索文本...',
      'Previous match': '上一个匹配',
      'Next match': '下一个匹配',
      'Loading PDF...': '正在加载 PDF...',
      'Loading PDF worker...': '正在加载PDF工作线程...',
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

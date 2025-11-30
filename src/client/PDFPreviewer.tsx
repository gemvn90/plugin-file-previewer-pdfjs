import React, { useState, useEffect, useRef } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import { Button, Spin, Modal, Space, InputNumber, Select, Tooltip, Input } from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  LeftOutlined,
  RightOutlined,
  DownloadOutlined,
  ExpandOutlined,
  CompressOutlined,
  SearchOutlined,
  UpOutlined,
  DownOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { saveAs } from 'file-saver';
import { useT } from './locale';

interface FileType {
  url: string;
  title: string;
  extname: string;
  mimetype?: string;
}

interface PDFPreviewerProps {
  index: number;
  list: FileType[];
  onSwitchIndex: (index: number | null) => void;
}

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];

export function PDFPreviewer({ index, list = [], onSwitchIndex }: PDFPreviewerProps) {
  const t = useT();
  
  // Early return if index is invalid or file doesn't exist
  if (index == null || index < 0 || index >= list.length) {
    return null;
  }
  
  const file = list[index];
  
  // Double check file exists and has required properties
  if (!file || !file.url) {
    return null;
  }
  
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfUrl, setPdfUrl] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pageWidth, setPageWidth] = useState(1200);
  const [searchText, setSearchText] = useState('');
  const [searchMatches, setSearchMatches] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [workerReady, setWorkerReady] = useState(false);
  const textLayerRef = useRef<HTMLDivElement>(null);

  // Configure PDF.js worker for version 3.x
  // CRITICAL: react-pdf sets a default worker URL that causes AMD issues
  // We MUST use Blob URL to prevent AMD/RequireJS from intercepting
  useEffect(() => {
    const workerUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    
    // Check if we already created a blob URL (avoid re-fetch on hot reload)
    if (pdfjs.GlobalWorkerOptions.workerSrc?.startsWith('blob:')) {
      console.log('Worker already configured with Blob URL:', pdfjs.GlobalWorkerOptions.workerSrc);
      setWorkerReady(true);
      return;
    }
    
    console.log('Fetching worker from CDN to create Blob URL...');
    
    // Always fetch and create blob URL to override react-pdf's default
    // This prevents AMD from intercepting the URL
    fetch(workerUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch worker: ${response.status} ${response.statusText}`);
        }
        console.log('Worker fetched successfully, creating blob...');
        return response.blob();
      })
      .then(blob => {
        // Create blob URL that AMD won't intercept
        const blobUrl = URL.createObjectURL(blob);
        pdfjs.GlobalWorkerOptions.workerSrc = blobUrl;
        console.log('PDF.js worker configured via Blob URL:', blobUrl);
        setWorkerReady(true);
      })
      .catch(err => {
        console.error('Failed to load PDF.js worker from CDN:', err);
        // Fallback: Try direct URL (may still be intercepted by AMD)
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
        console.warn('Fallback: Using direct CDN URL');
        setWorkerReady(true);
      });
  }, []); // Run once on mount

  useEffect(() => {
    if (!file?.url) return;
    try {
      const url = file.url.startsWith('http')
        ? file.url
        : `${window.location.origin}/${file.url.replace(/^\//, '')}`;
      setPdfUrl(url);
    } catch (err) {
      console.error('Error setting PDF URL:', err);
      setError(err as Error);
      setLoading(false);
    }
  }, [file?.url]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error('PDF load error:', error);
    setError(error);
    setLoading(false);
  }

  const handleDownload = () => {
    if (file) {
      saveAs(file.url, `${file.title}${file.extname}`);
    }
  };

  const changePage = (offset: number) => {
    setPageNumber(prev => Math.max(1, Math.min(prev + offset, numPages || 1)));
  };

  const handlePageChange = (value: number | null) => {
    if (value && value >= 1 && value <= (numPages || 1)) {
      setPageNumber(value);
    }
  };

  const handleZoomIn = () => {
    setScale(prev => {
      const currentIndex = ZOOM_LEVELS.findIndex(level => level >= prev);
      const nextIndex = currentIndex < ZOOM_LEVELS.length - 1 ? currentIndex + 1 : ZOOM_LEVELS.length - 1;
      return ZOOM_LEVELS[nextIndex];
    });
  };

  const handleZoomOut = () => {
    setScale(prev => {
      const currentIndex = ZOOM_LEVELS.findIndex(level => level >= prev);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : 0;
      return ZOOM_LEVELS[prevIndex];
    });
  };

  const handleZoomChange = (value: number) => {
    setScale(value);
  };

  const handleRotateLeft = () => {
    setRotation(prev => (prev - 90) % 360);
  };

  const handleRotateRight = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFitWidth = () => {
    setScale(1);
  };

  const handleFitPage = () => {
    setScale(0.75);
  };

  const handleClose = () => {
    onSwitchIndex(null);
  };

  useEffect(() => {
    if (searchText && textLayerRef.current) {
      performSearch();
    } else {
      clearSearchHighlights();
    }
  }, [searchText, pageNumber]);

  const performSearch = () => {
    if (!searchText || !textLayerRef.current) {
      setSearchMatches(0);
      setCurrentMatch(0);
      return;
    }

    clearSearchHighlights();

    const textLayer = textLayerRef.current.querySelector('.react-pdf__Page__textContent');
    if (!textLayer) return;

    const textItems = Array.from(textLayer.querySelectorAll('span'));
    let matchCount = 0;

    textItems.forEach(item => {
      const text = item.textContent || '';
      const lowerText = text.toLowerCase();
      const lowerSearch = searchText.toLowerCase();
      
      if (lowerText.includes(lowerSearch)) {
        const startIndex = lowerText.indexOf(lowerSearch);
        const beforeMatch = text.substring(0, startIndex);
        const match = text.substring(startIndex, startIndex + searchText.length);
        const afterMatch = text.substring(startIndex + searchText.length);

        item.innerHTML = '';
        
        if (beforeMatch) {
          item.appendChild(document.createTextNode(beforeMatch));
        }
        
        const mark = document.createElement('mark');
        mark.textContent = match;
        mark.style.backgroundColor = '#ffff00';
        mark.style.color = '#000';
        mark.setAttribute('data-match-index', matchCount.toString());
        item.appendChild(mark);
        
        if (afterMatch) {
          item.appendChild(document.createTextNode(afterMatch));
        }
        
        matchCount++;
      }
    });

    setSearchMatches(matchCount);
    if (matchCount > 0) {
      setCurrentMatch(1);
      highlightCurrentMatch(1);
    } else {
      setCurrentMatch(0);
    }
  };

  const clearSearchHighlights = () => {
    if (!textLayerRef.current) return;
    const marks = textLayerRef.current.querySelectorAll('mark');
    marks.forEach(mark => {
      const text = mark.textContent || '';
      const textNode = document.createTextNode(text);
      mark.parentNode?.replaceChild(textNode, mark);
    });
  };

  const highlightCurrentMatch = (matchIndex: number) => {
    if (!textLayerRef.current) return;
    const marks = textLayerRef.current.querySelectorAll('mark');
    marks.forEach((mark, index) => {
      if (index === matchIndex - 1) {
        (mark as HTMLElement).style.backgroundColor = '#ff9632';
        mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        (mark as HTMLElement).style.backgroundColor = '#ffff00';
      }
    });
  };

  const handleSearchNext = () => {
    if (searchMatches === 0) return;
    const nextMatch = currentMatch >= searchMatches ? 1 : currentMatch + 1;
    setCurrentMatch(nextMatch);
    highlightCurrentMatch(nextMatch);
  };

  const handleSearchPrev = () => {
    if (searchMatches === 0) return;
    const prevMatch = currentMatch <= 1 ? searchMatches : currentMatch - 1;
    setCurrentMatch(prevMatch);
    highlightCurrentMatch(prevMatch);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleSearchClear = () => {
    setSearchText('');
    setSearchMatches(0);
    setCurrentMatch(0);
    setShowSearch(false);
    clearSearchHighlights();
  };

  const toolbar = (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '12px 16px',
      backgroundColor: '#f5f5f5',
      borderRadius: '4px',
      marginBottom: '12px',
      gap: '8px',
      flexWrap: 'wrap'
    }}>
      <Space.Compact>
        <Tooltip title={t('Previous page')}>
          <Button
            icon={<LeftOutlined />}
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
          />
        </Tooltip>
        <InputNumber
          min={1}
          max={numPages || 1}
          value={pageNumber}
          onChange={handlePageChange}
          style={{ width: 60 }}
        />
        <Tooltip title={t('Next page')}>
          <Button
            icon={<RightOutlined />}
            onClick={() => changePage(1)}
            disabled={pageNumber >= (numPages || 1)}
          />
        </Tooltip>
      </Space.Compact>

      <span style={{ color: '#666', fontSize: '14px' }}>
        / {numPages || 0}
      </span>

      <div style={{ width: 1, height: 24, backgroundColor: '#d9d9d9' }} />

      <Space.Compact>
        <Tooltip title={t('Zoom out')}>
          <Button
            icon={<ZoomOutOutlined />}
            onClick={handleZoomOut}
            disabled={scale <= ZOOM_LEVELS[0]}
          />
        </Tooltip>
        <Select
          value={scale}
          onChange={handleZoomChange}
          style={{ width: 100 }}
          options={ZOOM_LEVELS.map(level => ({
            label: `${Math.round(level * 100)}%`,
            value: level
          }))}
        />
        <Tooltip title={t('Zoom in')}>
          <Button
            icon={<ZoomInOutlined />}
            onClick={handleZoomIn}
            disabled={scale >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
          />
        </Tooltip>
      </Space.Compact>

      <div style={{ width: 1, height: 24, backgroundColor: '#d9d9d9' }} />

      <Space>
        <Tooltip title={t('Rotate left')}>
          <Button
            icon={<RotateLeftOutlined />}
            onClick={handleRotateLeft}
          />
        </Tooltip>
        <Tooltip title={t('Rotate right')}>
          <Button
            icon={<RotateRightOutlined />}
            onClick={handleRotateRight}
          />
        </Tooltip>
      </Space>

      <div style={{ width: 1, height: 24, backgroundColor: '#d9d9d9' }} />

      <Space>
        <Tooltip title={t('Fit to width')}>
          <Button
            icon={<ExpandOutlined />}
            onClick={handleFitWidth}
          />
        </Tooltip>
        <Tooltip title={t('Fit to page')}>
          <Button
            icon={<CompressOutlined />}
            onClick={handleFitPage}
          />
        </Tooltip>
      </Space>

      <div style={{ width: 1, height: 24, backgroundColor: '#d9d9d9' }} />

      <Tooltip title={t('Search in document')}>
        <Button
          icon={<SearchOutlined />}
          onClick={() => setShowSearch(!showSearch)}
          type={showSearch ? 'primary' : 'default'}
        />
      </Tooltip>
    </div>
  );

  const searchBar = showSearch && (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '8px 16px',
      backgroundColor: '#fafafa',
      borderRadius: '4px',
      marginBottom: '12px',
      gap: '8px'
    }}>
      <Input
        placeholder={t('Search text...')}
        value={searchText}
        onChange={handleSearchChange}
        prefix={<SearchOutlined />}
        suffix={
          searchText && (
            <CloseOutlined 
              onClick={handleSearchClear} 
              style={{ cursor: 'pointer', color: '#999' }}
            />
          )
        }
        style={{ flex: 1, maxWidth: 300 }}
        onPressEnter={handleSearchNext}
      />
      {searchMatches > 0 && (
        <span style={{ color: '#666', fontSize: '14px', whiteSpace: 'nowrap' }}>
          {currentMatch} / {searchMatches}
        </span>
      )}
      <Space.Compact>
        <Tooltip title={t('Previous match')}>
          <Button
            icon={<UpOutlined />}
            onClick={handleSearchPrev}
            disabled={searchMatches === 0}
            size="small"
          />
        </Tooltip>
        <Tooltip title={t('Next match')}>
          <Button
            icon={<DownOutlined />}
            onClick={handleSearchNext}
            disabled={searchMatches === 0}
            size="small"
          />
        </Tooltip>
      </Space.Compact>
    </div>
  );

  return (
    <>
      <style>
        {`
          .react-pdf__Page__textContent {
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            overflow: hidden;
            opacity: 0.2;
            line-height: 1.0;
          }
          .react-pdf__Page__textContent span {
            color: transparent;
            position: absolute;
            white-space: pre;
            cursor: text;
            transform-origin: 0% 0%;
          }
          .react-pdf__Page__textContent mark {
            color: #000;
            opacity: 1;
          }
        `}
      </style>
      <Modal
        open={index != null}
        title={file.title}
        onCancel={handleClose}
        footer={[
          <Button key="download" icon={<DownloadOutlined />} onClick={handleDownload}>
            {t('Download')}
          </Button>,
          <Button key="close" onClick={handleClose}>
            {t('Close')}
          </Button>,
        ]}
        width="90vw"
        centered
        styles={{ body: { maxHeight: '80vh', overflowY: 'auto' } }}
      >
      <Spin spinning={loading || !workerReady}>
        {toolbar}
        {searchBar}
        <div 
          ref={textLayerRef}
          style={{ 
            height: '65vh', 
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            backgroundColor: '#525659',
            padding: '20px'
          }}
        >
          {!workerReady ? (
            <div style={{ 
              color: 'white', 
              textAlign: 'center', 
              padding: 20,
              backgroundColor: 'rgba(0,0,0,0.3)',
              borderRadius: '4px'
            }}>
              {t('Loading PDF worker...')}
            </div>
          ) : error ? (
            <div style={{ 
              color: 'white', 
              textAlign: 'center', 
              padding: 20,
              backgroundColor: 'rgba(255,0,0,0.1)',
              borderRadius: '4px'
            }}>
              {t('Failed to load PDF:')} {error.message}
            </div>
          ) : (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
            >
              <Page
                pageNumber={pageNumber}
                width={pageWidth * scale}
                rotate={rotation}
                renderAnnotationLayer={false}
                renderTextLayer={true}
              />
            </Document>
          )}
        </div>
      </Spin>
      </Modal>
    </>
  );
}

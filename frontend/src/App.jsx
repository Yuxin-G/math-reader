import { useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import './App.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

const PDF_URL = 'http://127.0.0.1:8000/pdfs/main.pdf'

function App() {
  const viewerRef = useRef(null)

  const [numPages, setNumPages] = useState(null)
  const [pageWidth, setPageWidth] = useState(800)
  const [selectedContent, setSelectedContent] = useState({
    text: '',
    startPage: null,
    endPage: null,
  })

  useEffect(() => {
    const viewer = viewerRef.current

    if (!viewer) {
      return
    }

    const observer = new ResizeObserver(([entry]) => {
      const viewerWidth = entry.contentRect.width
      const availableWidth = viewerWidth - 48

      setPageWidth(Math.min(availableWidth, 1000))
    })

    observer.observe(viewer)

    return () => {
      observer.disconnect()
    }
  }, [])

  function handleLoadSuccess({ numPages }) {
    setNumPages(numPages)
  }

  function getPageNumber(node) {
    if (!node) {
      return null
    }

    const element =
      node.nodeType === Node.ELEMENT_NODE
        ? node
        : node.parentElement
    
    const pageWrapper = element?.closest('.pdf-page-wrapper')

    return pageWrapper?.dataset.pageNumber ?? null
  }

  function handleTextSelection() {
    const selection = window.getSelection()

    if (!selection || selection.rangeCount === 0) {
      return
    }

    const selectedText = selection.toString().trim()

    if (!selectedText) {
      return
    }

    const range = selection.getRangeAt(0)

    const startPage = getPageNumber(range.startContainer)
    const endPage = getPageNumber(range.endContainer)

    if (!startPage || !endPage) {
      return
    }

    setSelectedContent({
      text: selectedText,
      startPage: Number(startPage),
      endPage: Number(endPage),
    })
  }
  return (
    <main className="app-layout">
      <section 
        ref={viewerRef} 
        className="pdf-panel"
        onMouseUp={handleTextSelection}
      >
        <Document
          file={PDF_URL}
          onLoadSuccess={handleLoadSuccess}
          loading={<p>Loading PDF...</p>}
          error={<p>Failure to load PDF</p>}
        >
          {Array.from({ length: numPages ?? 0}, (_, index) => {
            const pageNumber = index + 1

            return (
              <div
                key={pageNumber}
                className="pdf-page-wrapper"
                data-page-number={pageNumber}
              >
                <Page
                  pageNumber={pageNumber}
                  width={pageWidth}
                />
              </div>
            )
          })}
        </Document>
      </section>

      <aside className="side-panel">
        {/* Right upper corner: show selected PDF */}
        <section className="side-section selection-panel">
          <h2>Selected Contents</h2>

          {selectedContent.text ? (
            <div className="selected-content">
              <div className="selected-page">
                {selectedContent.startPage === selectedContent.endPage
                  ? `Page ${selectedContent.startPage}`
                  : `Pages ${selectedContent.startPage}-${selectedContent.endPage}`}
              </div>

              <div className='selected-text'>
                {selectedContent.text} 
              </div>
            </div>
          ) : (
            <div className='selection-placeholder'>
              Please select on the left hand side.
            </div>
          )}
        </section>

        {/* Right lower corner: notes, conversation and other utilities */}
        <section className="side-section assistant-panel">
          <h2>Contents Explaination</h2>
          
          <div className="assistant-placeholder">
            Here will be the explaination later
          </div>
        </section>
      </aside>
    </main>
  )
}

export default App
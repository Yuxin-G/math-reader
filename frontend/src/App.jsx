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

  return (
    <main className="app-layout">
      <section ref={viewerRef} className="pdf-panel">
        <Document
          file={PDF_URL}
          onLoadSuccess={handleLoadSuccess}
          loading={<p>Loading PDF...</p>}
          error={<p>Failure to load PDF</p>}
        >
          {Array.from({ length: numPages ?? 0}, (_, index) => (
            <Page
              key={index + 1}
              pageNumber={index + 1}
              width={pageWidth}
            />
          ))}
        </Document>
      </section>

      <aside className="side-panel">
        <h2>Reading Assistant</h2>
        <p>Utility needs to be developed.</p>
      </aside>
    </main>
  )
}

export default App
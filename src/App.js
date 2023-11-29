import { useEffect, useMemo, useState, } from 'react';
import Draggable from 'react-draggable';
import "react-mask-editor/dist/style.css"

import images from './images';
import UploadImage from './components/UploadImage';

function App() {
  const windowId = useMemo(() => Math.random(), [])
  const [loading, setLoading] = useState(true) // load images effect
  const [position, setPosition] = useState({ x: window.innerWidth / 4, y: 0 }) // relative image's postion
  const [image, setImage] = useState(images[0])
  const image1Url = image.censor // 
  const image2Url = image.uncensor
  const [index, setIndex] = useState(0) // 0: original window, 1: base image window, 2: uncensor image window

  const bc = useMemo(() => new BroadcastChannel('biya'), []);

  const handleOpenNewWindow = () => {
    // manual open is also ok 
    if (index !== 2) {
      window.open(window.location.href, '_blank',
        index === 0 ?
          `toolbar=no, menubar=no, location=yes,height=${window.innerHeight},width=${window.innerWidth},scrollbars=no,status=yes`
          :
          `toolbar=no, menubar=no, location=yes,height=${window.innerHeight / 4},width=${window.innerWidth / 4},scrollbars=no,status=yes`
      )
    } else {
      window.close()
    }
  }

  const handleSetImage = (img) => {
    setImage(img)
    handleOpenNewWindow()
  }

  // update and emit new position
  const updateNewPosition = ({ x, y }) => {
    bc.postMessage({ type: 'update_position', value: { x, y, windowX: window.screenX, windowY: window.screenY } })
    setPosition({ x, y })
  }

  useEffect(() => {
    bc.onmessage = (event) => {
      switch (event.data.type) {
        case 'new_tab':
          if (index === 0) {
            bc.postMessage({ type: 'index_1', value: event.data.value, })
            bc.postMessage({ type: 'image', value: image })
          } else if (index === 1) {
            bc.postMessage({ type: 'index_2', value: event.data.value, })
            updateNewPosition(position)
            bc.postMessage({ type: 'image', value: image })
          } else {
            bc.postMessage({ type: 'index_1', value: event.data.value, })
          }
          break;
        case 'index_1':
          if (event.data.value === windowId) {
            setIndex(1)
            document.title = image.title
          }
          break;
        case 'index_2':
          if (event.data.value === windowId) {
            setIndex(2)
            document.title = "Gương thần"
          }
          break;
        case 'update_position': // sync image's position accross window
          const { x, y, windowX, windowY } = event.data.value
          const absoluteX = windowX + x
          const absoluteY = windowY + y
          setPosition({ x: absoluteX - window.screenX, y: absoluteY - window.screenY })
          break;
        case 'image': // sync image id
          console.log(event.data.value)
          setImage(event.data.value)
          break;
        default:
          break;
      }
    };

    return () => bc.onmessage = null
  }, [bc, windowId, index, image,])

  // detect window moved
  useEffect(() => {
    var oldX = window.screenX,
      oldY = window.screenY;

    const interval = setInterval(function () {
      if (oldX !== window.screenX || oldY !== window.screenY) {
        updateNewPosition({ x: position.x - window.screenX + oldX, y: position.y - window.screenY + oldY })
      }
      oldX = window.screenX;
      oldY = window.screenY;
    }, 1);

    return () => clearInterval(interval)
  }, [position])

  // boarding case new_tab event
  useEffect(() => {
    bc.postMessage({ type: 'new_tab', value: windowId });
  }, [windowId])

  // loading images effect
  useEffect(() => {
    setLoading(true)
    Promise.all(
      Array.from(document.images)
        .filter(img => !img.complete)
        .map(img => new Promise(
          resolve => { img.onload = img.onerror = resolve; }
        ))).then(() => {
          setLoading(false)
        });
  }, [image])

  return (
    <>
      {loading && index !== 0 &&
        <div class="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center">
          <div class="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
          <h2 class="text-center text-white text-xl font-semibold">Đang tải...</h2>
          <p class="w-1/3 text-center text-white">Đừng lóng, chờ 1 xíu là tải xong...</p>
        </div>
      }
      <div className="App min-w-[100vw] min-h-[100vh] bg-gray-50 dark:bg-gray-800 pt-2  dark:text-white">
        <div className='container mx-auto text-center pt-2 px-1'>

          {
            index === 0 ?
              <>
                <h1 className="text-4xl font-extrabold leading-none tracking-tight text-gray-900  dark:text-white uppercase mb-2">Gương chiếu sếch</h1>
                <a
                  target='_blank'
                  href="https://github.com/zennomi/Seg-Mirror"
                  className="inline-flex gap-x-1 mb-2 items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"
                    />
                  </svg>
                  Github
                </a>
              </>
              :
              <div className='flex flex-col gap-y-2 mb-2'>
                <label for="images" className="block text-sm font-medium text-gray-900 dark:text-white">Chọn ảnh</label>
                <select
                  id="images"
                  className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                  value={images.findIndex(img => img.censor === image) || -1}
                  onChange={(event) => {
                    console.log("Change Event!")
                    setImage(images[event.target.value])
                    bc.postMessage({ type: 'image', value: event.target.value })
                  }}
                >
                  <option value={index}>{image.title || "Ảnh tự đăng"}</option>
                  {
                    images.map((image, index) => <option value={index}>{image.title}</option>)
                  }
                </select>
              </div>
          }
          <div className='flex flex-col gap-y-2'>
            <button
              className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
              onClick={handleOpenNewWindow}>{
                index === 0 ? "Mở ảnh sếch" :
                  index === 1 ? "Mở gương thần" : "Đóng gương thần"
              }
            </button>
            {
              index === 0 && <>
                <div>Hoặc</div>
                <UploadImage setImage={handleSetImage} />
              </>
            }
          </div>
        </div>
        {index !== 0
          &&
          <Draggable
            position={position}
            onDrag={(event, data) => {
              updateNewPosition({ x: data.x, y: data.y });
            }}
          >
            <img className='cursor-move max-w-[900px]' src={index === 2 ? image2Url : image1Url} draggable="false" />
          </Draggable>
        }
      </div>
    </>
  );
}

export default App;

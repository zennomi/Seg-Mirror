import { useRef, useState } from "react";
import { MaskEditor, toMask } from "./MarkEditor";

const UploadImage = ({ setImage }) => {
    const [file, setFile] = useState(null)
    const canvas = useRef();

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleClick = () => {
        if (!file || !canvas.current) return
        const uncensor = toMask(canvas.current)
        const censor = URL.createObjectURL(file)
        const newImage = { title: file.name, uncensor, censor }
        setImage(newImage)
    }

    return (
        <div>
            <input
                class="mb-2 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" id="file_input" type="file"
                onChange={handleFileChange}
            ></input>
            {file && (
                <section>
                    File details:
                    <ul>
                        <li>Name: {file.name}</li>
                        <li>Type: {file.type}</li>
                        <li>Size: {file.size} bytes</li>
                    </ul>

                    <MaskEditor
                        src={URL.createObjectURL(file)}
                        canvasRef={canvas}
                        maskColor="#ffffff"
                        maskOpacity={0.8}
                    />
                    <button
                        className="mt-2 relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
                        onClick={handleClick}
                    >
                        <span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                            Tụtttttttt
                        </span>
                    </button>
                </section>
            )}
        </div>
    )
}

export default UploadImage
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
        console.log(newImage)
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
                        maskOpacity={1}
                    />
                    <button
                        className="mt-2 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                        onClick={handleClick}
                    >
                        Sếchhhhh
                    </button>
                </section>
            )}
        </div>
    )
}

export default UploadImage
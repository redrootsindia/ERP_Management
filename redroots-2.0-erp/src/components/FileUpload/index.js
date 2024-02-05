import React, { useState, useEffect } from 'react'
import { Button, Upload } from 'antd'
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons'

const FileUpload = (props) => {
  // prettier-ignore
  const { existingFileNames, emptyFiles, prependURL, onUploadCallback, onRemoveCallback, maxFiles, editMode } = props
  const [fileList, setFileList] = useState([])
  console.log('fileList', fileList)
  const maxFilesCount = maxFiles ? Number(maxFiles) : 1
  const disabled = editMode || (fileList.length && fileList.length >= maxFilesCount)

  useEffect(() => {
    if (existingFileNames && existingFileNames.length) {
      const tempFileList = existingFileNames.map((file, i) => ({
        uid: `-${i}`,
        name: file,
        status: 'done',
        response: 'Server Error 500', // custom error message to show when file isn't found
        url: `${prependURL}${file}`,
      }))
      setFileList(tempFileList)
      console.log('tempFileList', tempFileList)
    }
  }, [existingFileNames])

  useEffect(() => {
    if (emptyFiles) {
      setFileList([])
    }
  }, [emptyFiles])

  const tempIncomingFileList = []
  const customUploadRequest = async (incomingFile) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      tempIncomingFileList.push({
        file: incomingFile.file,
        uid: incomingFile.file.uid,
        name: incomingFile.file.name,
        status: 'done',
        url: reader.result,
        isNew: true,
      })
      if (onUploadCallback) onUploadCallback(tempIncomingFileList.map((files) => files.file))
      setFileList([...fileList, ...tempIncomingFileList])
    })
    reader.readAsDataURL(incomingFile.file)
  }

  const handleUploadChange = (changeData) => {
    if (changeData && changeData.fileList && changeData.fileList.length < fileList.length)
      setFileList(changeData.fileList)
  }

  const onRemove = (file) => {
    if (file && file.name && onRemoveCallback) onRemoveCallback(file.name, file.isNew)
  }

  return (
    <Upload
      multiple
      customRequest={customUploadRequest}
      onChange={handleUploadChange}
      onRemove={onRemove}
      fileList={fileList}
      onPreview={(file) => {
        window.open(`${prependURL}${file.name}`)
      }}
      supportServerRender
      showUploadList={{
        showDownloadIcon: false,
        showPreviewIcon: true,
        showRemoveIcon: !editMode,
        removeIcon: <DeleteOutlined />,
      }}
    >
      {!disabled ? (
        <Button disabled={disabled} icon={<UploadOutlined />} style={{ marginBottom: 0 }}>
          Upload
        </Button>
      ) : null}
    </Upload>
  )
}

export default FileUpload

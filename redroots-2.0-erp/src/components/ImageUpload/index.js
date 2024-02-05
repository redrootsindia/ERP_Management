import React, { useState, useEffect } from 'react'
import { Button, Upload, Image, message } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
// import ImgCrop from 'antd-img-crop'

const ImageUpload = (props) => {
  // prettier-ignore
  const { existingImages, emptyImages,onUploadCallback, onRemoveCallback, maxImages, editMode, placeholderType,prependURL } = props
  const [fileList, setFileList] = useState([])

  useEffect(() => {
    if (existingImages && existingImages.length) {
      const tempFileList = existingImages.map((image, i) => ({
        uid: `-${i}`,
        name: image,
        status: 'done',
        url: prependURL ? `${prependURL}${image}` : image,
      }))
      setFileList(tempFileList)
    }
  }, [existingImages])

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng) message.error('You can only upload JPG/PNG file')
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) message.error('Image must smaller than 5 MB!')
    return isJpgOrPng && isLt5M
  }

  const customUploadRequest = (imageFile) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      setFileList([
        ...fileList,
        {
          uid: imageFile.file.uid,
          name: imageFile.file.name,
          status: 'done',
          url: reader.result,
          isNew: true,
        },
      ])
      if (onUploadCallback) onUploadCallback(imageFile.file)
    })
    reader.readAsDataURL(imageFile.file)
  }

  useEffect(() => {
    if (emptyImages) {
      setFileList([])
    }
  }, [emptyImages])

  const handleUploadChange = (changeData) => {
    if (changeData && changeData.fileList && changeData.fileList.length < fileList.length)
      setFileList(changeData.fileList)

    // if (changeData && (!changeData.fileList || !changeData.fileList.length) && onRemoveCallback)
    //   onRemoveCallback(null)
  }

  const onRemove = (file) => {
    if (file && file.name && onRemoveCallback) onRemoveCallback(file.name, file.isNew)
  }

  const toggleUploadButton = () => {
    const maxImagesCount = maxImages ? Number(maxImages) : 1
    if (!editMode) return null
    if (fileList.length && fileList.length >= maxImagesCount) return null
    return (
      <div>
        <Button style={{ marginBottom: 0 }}>+ Image</Button>
      </div>
    )
  }

  return editMode ? (
    // <ImgCrop rotate aspect={1.3 / 1.7}>
    <Upload
      listType="picture-card"
      disabled={!editMode}
      beforeUpload={beforeUpload}
      customRequest={customUploadRequest}
      onChange={handleUploadChange}
      onRemove={onRemove}
      fileList={fileList}
      supportServerRender
      showUploadList={{
        showRemoveIcon: editMode,
        showDownloadIcon: true,
        showPreviewIcon: false,
      }}
    >
      {toggleUploadButton()}
    </Upload>
  ) : // </ImgCrop>
  existingImages && existingImages.length ? (
    <Image.PreviewGroup>
      {existingImages.map((image) => (
        <Image
          key={Math.random()}
          src={prependURL ? `${prependURL}${image}` : image}
          height={image ? 100 : 20}
          width={image ? 100 : 20}
          alt="not-found"
          fallback={`resources/images/placeholder/${placeholderType || 'general'}.png`}
          preview={{ mask: <EyeOutlined /> }}
        />
      ))}
    </Image.PreviewGroup>
  ) : (
    <img
      src={`resources/images/placeholder/${placeholderType || 'general'}.png`}
      width={30}
      height={30}
      alt="not-found"
    />
  )
}

export default ImageUpload

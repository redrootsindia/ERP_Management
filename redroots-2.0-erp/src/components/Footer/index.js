import React from 'react'
import style from './style.module.scss'

const Footer = () => {
  return (
    <div className={style.footer}>
      <div className={style.footerInner}>
        <div className="mb-0">
          <div className={style.logo}>
            <img src="resources/images/logo/pixels_logo.png" alt="logo" />
          </div>
          &emsp; Designed by Pixels Agency
        </div>
      </div>
    </div>
  )
}

export default Footer

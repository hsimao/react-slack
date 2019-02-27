import React, { Component } from 'react'
// 無限輪播樣式
// import style from './styleLnfinite.module.scss'
import style from './style.module.scss'

class Logo extends Component {
  render() {
    return (
      <div>
        <div className={style.slack}>
          <span className={`${style.dot} ${style['dot--a']}`} />
          <span className={`${style.dot} ${style['dot--b']}`} />
          <span className={`${style.dot} ${style['dot--c']}`} />
          <span className={`${style.dot} ${style['dot--d']}`} />
        </div>
      </div>
    )
  }
}

export default Logo

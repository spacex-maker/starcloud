import { createGlobalStyle } from 'styled-components'
import  { globalStyles } from 'twin.macro'

const GlobalStyles = createGlobalStyle`
  :root {
    color-scheme: ${props => props.theme.mode};
  }

  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: var(--ant-color-bg-container);
    color: var(--ant-color-text);
    min-height: 100vh;
  }

  * {
    box-sizing: border-box;
  }

  /* 确保暗色模式下的文本可见性 */
  .dark {
    color-scheme: dark;
  }

  #root {
    min-height: 100vh;
  }

  /* 模态框圆角样式 */
  .ant-modal .ant-modal-content {
    border-radius: 20px !important;
    overflow: hidden;
  }

  .ant-modal .ant-modal-header {
    border-radius: 20px 20px 0 0 !important;
  }

  /* Below animations are for modal created using React-Modal */
  .ReactModal__Overlay {
    transition: transform 300ms ease-in-out;
    transition-delay: 100ms;
    transform: scale(0);
    
    &--after-open {
      transform: scale(1);
    }
    
    &--before-close {
      transform: scale(0);
    }
  }
`

export default GlobalStyles
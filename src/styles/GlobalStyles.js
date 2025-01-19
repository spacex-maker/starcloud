import { createGlobalStyle } from 'styled-components'
import  { globalStyles } from 'twin.macro'

const GlobalStyles = createGlobalStyle(globalStyles, `
  body {
    margin: 0;
    background: linear-gradient(to bottom right, #1e3a8a, #581c87, #3730a3);
    min-height: 100vh;
  }

  #root {
    min-height: 100vh;
  }

  /* Below animations are for modal created using React-Modal */
  .ReactModal__Overlay {
    transition: transform 300ms ease-in-out;
    transition-delay: 100ms;
    transform: scale(0);
  }
  .ReactModal__Overlay--after-open{
    transform: scale(1);
  }
  .ReactModal__Overlay--before-close{
    transform: scale(0);
  }
`)

export default GlobalStyles
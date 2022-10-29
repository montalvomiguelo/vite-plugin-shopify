class HelloWorld extends window.HTMLElement {
  button: HTMLButtonElement
  output: HTMLOutputElement
  
  constructor() {
    super()

    this.button = this.querySelector('button') as HTMLButtonElement
    this.output = this.querySelector('output') as HTMLOutputElement

    this.button.addEventListener('click', event => {
      event.preventDefault()
      this.output.value = String(+this.output.value + 1)
    })
  }
}

window.customElements.define('hello-world', HelloWorld)

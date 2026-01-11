declare namespace JSX {
  interface IntrinsicElements {
    'codiris-widget': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      'agent-id'?: string;
      'width'?: string;
      'prompt-bar'?: string;
    };
  }
}

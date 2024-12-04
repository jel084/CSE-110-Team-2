declare module "*.png" {
    const value: string;
    export default value;
}

declare namespace JSX {
    interface IntrinsicElements {
      'box-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        name?: string;
        type?: string;
        color?: string;
        size?: string;
        animation?: string;
      };
    }
  }
  
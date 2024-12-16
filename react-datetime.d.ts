declare module 'react-datetime' {
    import { ComponentType } from "react";
  
    interface DatetimeProps {
      // Define specific props here if needed, or use `any`
      value?: Date | string;
      onChange?: (value: Date) => void;
      input?: boolean;
      [key: string]: any;
    }
  
    const Datetime: ComponentType<DatetimeProps>;
    export default Datetime;
  }
  
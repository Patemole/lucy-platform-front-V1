declare module 'react-big-calendar' {
  import { ComponentType } from 'react';

  export interface CalendarProps<TEvent = object, TResource = object> {
    localizer: any;
    events: TEvent[];
    startAccessor: string | ((event: TEvent) => Date);
    endAccessor: string | ((event: TEvent) => Date);
    style?: React.CSSProperties;
    defaultView?: string;
    views?: string[];
    components?: any;
    eventPropGetter?: (event: TEvent, start: Date, end: Date, isSelected: boolean) => {
      style: React.CSSProperties;
    };
  }

  export const Calendar: ComponentType<CalendarProps>;
  export function dateFnsLocalizer(params: any): any;
}

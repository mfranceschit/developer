import { DatePicker as ArkDatePicker, parseDate, Portal } from '@ark-ui/react';

export type DatePickerProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (isoDate: string) => void;
  disabled?: boolean;
  className?: string;
};

const inputClasses =
  'w-full px-[var(--field-pad-x)] py-[var(--field-pad-y)] font-sans text-sm text-[var(--text-field)] ' +
  'bg-[var(--surface-field)] border border-[var(--border-default)] rounded-md outline-none ' +
  'transition-[border-color,box-shadow] duration-[120ms] ' +
  'focus:border-[var(--focus-ring)] focus:shadow-focus ' +
  'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed';

const contentClasses =
  'z-50 rounded-md bg-[var(--surface-overlay)] border border-[var(--border-subtle)] shadow-md p-3';

const cellTriggerClasses =
  'w-8 h-8 flex items-center justify-center rounded-sm font-sans text-sm text-[var(--text-body)] ' +
  'cursor-pointer data-[selected]:bg-[var(--primary)] data-[selected]:text-[var(--text-inverse)] ' +
  'data-[today]:font-semibold hover:bg-[var(--primary-soft)]';

export function DatePicker({
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  className = '',
}: DatePickerProps) {
  return (
    <ArkDatePicker.Root
      value={value ? [parseDate(value)] : undefined}
      defaultValue={defaultValue ? [parseDate(defaultValue)] : undefined}
      onValueChange={(details) => {
        const iso = details.value[0]?.toString();
        if (iso) onValueChange?.(iso);
      }}
      disabled={disabled}
      className={className}
    >
      <ArkDatePicker.Control>
        <ArkDatePicker.Input className={inputClasses} />
        <ArkDatePicker.Trigger />
      </ArkDatePicker.Control>
      <Portal>
        <ArkDatePicker.Positioner>
          <ArkDatePicker.Content className={contentClasses}>
            <ArkDatePicker.View view="day">
              <ArkDatePicker.Context>
                {(datePicker) => (
                  <>
                    <ArkDatePicker.ViewControl>
                      <ArkDatePicker.PrevTrigger>‹</ArkDatePicker.PrevTrigger>
                      <ArkDatePicker.ViewTrigger>
                        <ArkDatePicker.RangeText />
                      </ArkDatePicker.ViewTrigger>
                      <ArkDatePicker.NextTrigger>›</ArkDatePicker.NextTrigger>
                    </ArkDatePicker.ViewControl>
                    <ArkDatePicker.Table>
                      <ArkDatePicker.TableHead>
                        <ArkDatePicker.TableRow>
                          {datePicker.weekDays.map((weekDay, i) => (
                            <ArkDatePicker.TableHeader key={i}>
                              {weekDay.narrow}
                            </ArkDatePicker.TableHeader>
                          ))}
                        </ArkDatePicker.TableRow>
                      </ArkDatePicker.TableHead>
                      <ArkDatePicker.TableBody>
                        {datePicker.weeks.map((week, i) => (
                          <ArkDatePicker.TableRow key={i}>
                            {week.map((day, j) => (
                              <ArkDatePicker.TableCell key={j} value={day}>
                                <ArkDatePicker.TableCellTrigger className={cellTriggerClasses}>
                                  {day.day}
                                </ArkDatePicker.TableCellTrigger>
                              </ArkDatePicker.TableCell>
                            ))}
                          </ArkDatePicker.TableRow>
                        ))}
                      </ArkDatePicker.TableBody>
                    </ArkDatePicker.Table>
                  </>
                )}
              </ArkDatePicker.Context>
            </ArkDatePicker.View>
          </ArkDatePicker.Content>
        </ArkDatePicker.Positioner>
      </Portal>
    </ArkDatePicker.Root>
  );
}

import React, { useState } from 'react';
import "./index.css";

const today = new Date();

type Props = {
  /** A locale string (e.g. "en-US", "en", "fr-FR", etc.) in [Unicode BCP 47 Locale Identifiers format](https://unicode.org/reports/tr35/). */
  locale?: Intl.UnicodeBCP47LocaleIdentifier
  /** The function to call when the selected date changes. */
  onChange: (date: Date) => void
}

/**
 * Calendar component for selecting a date.
 * @param {Intl.UnicodeBCP47LocaleIdentifier} props.locale - A locale string (e.g. "en-US", "en", "fr-FR", etc.) in [Unicode BCP 47 Locale Identifiers format](https://unicode.org/reports/tr35/).
 * @param {(date: Date) => void} props.onChange - The function to call when the selected date changes.
 */
export default function Calendar({
  locale = navigator.language,
  ...props
}: Props) {
  const [selected, setSelected] = useState(today)
  const [focused, setFocused] = useState(today)
  const days = useDays(focused)

  const btn = "hover:bg-gray-200 focus-visible:ring-indigo-500 ring-2 ring-inset ring-transparent rounded-md outline-none"

  return (
    <div className="text-center text-2xl flex">
      <button onClick={() => setFocused(setDate(focused, 'month', focused.getMonth() - 1))} className={classNames(btn)}>
        <Chevron className="rotate-180" />
      </button>
      <div className="grid grid-cols-7 rounded-lg">
        <div className="col-span-7 flex-auto font-semibold">
          <select
            className={classNames(btn, "w-2/3 p-2")}
            value={focused.getMonth()}
            onChange={(e) => setFocused(setDate(focused, "month", parseInt((e.target as HTMLSelectElement).value)))}
          >
            {arr(12, (_, i) => new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2022, i))).map((x, i) =>
              <option key={i} value={i}>{x}</option>
            )}
          </select>
          <select
            className={classNames(btn, "w-1/3 p-2")}
            value={focused.getFullYear()}
            onChange={(e) => setFocused(setDate(focused, 'year', parseInt((e.target as HTMLSelectElement).value)))}
          >
            {arr(5, today.getFullYear()).map((j, i) =>
              <option key={i} value={j + i - 1}>{j + i - 1}</option>
            )}
          </select>
        </div>
        <ul className="grid grid-cols-7 col-span-7 mb-2">
          {arr(7, (_, i) =>
            new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(
              new Date(0, 0, i + 1)
            )
          )
            .map((day, i) => (
              <li key={i} className="p-1.5 flex items-center justify-center text-base text-gray-400">
                {day}
              </li>
            ))
          }
        </ul>
        {days.map((day, i) => {
          const date = new Date(day)
          const sameMonth = focused.getMonth() === date.getMonth()
          const isToday = isSameDay(date, today)
          const isSelected = isSameDay(date, selected)

          return <button
            key={i}
            className={classNames(btn, "group p-1")}
            onClick={() => {
              setSelected(date)
              props.onChange(date)
              if (!sameMonth) setFocused(date)
            }}
          >
            <time
              className={classNames(
                'p-1 flex items-center justify-center aspect-square rounded-md ring-1',
                sameMonth ? "font-medium" : "text-black/50",
                isSelected && 'bg-indigo-500 text-white',
                isToday ? 'ring-indigo-500' : "ring-transparent",
                !isSelected && !isToday && 'group-hover:bg-gray-200'
              )}
              dateTime={date.toISOString()}>
              {date.getDate()}
            </time>
          </button>
        })}
        <button
          className={classNames(btn, "col-span-7 flex items-center justify-center p-1 rounded-md mt-2")}
          onClick={() => {
            setFocused(today);
            setSelected(today);
            props.onChange(today)
          }}
        >
          {cap(new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).formatToParts(0, 'day')[0]?.value || "")}
        </button>
      </div>
      <button onClick={() => setFocused(setDate(focused, 'month', focused.getMonth() + 1))} className={classNames(btn)}>
        <Chevron />
      </button>
    </div>
  )
}

const Chevron = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={classNames("w-12 h-12", className)}>
    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
  </svg>
)

const cap = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);

function arr<T>(n: number, cb?: ((x: unknown, i: number) => T) | T): T[] {
  return Array(n).fill(0).map((x, i) => cb ? cb instanceof Function ? cb(x, i) : cb : x)
}

function useDays(date: Date) {
  let start = new Date(date.getFullYear(), date.getMonth(), 1);

  while (start.getDay() !== 1) {
    start = new Date(start.getFullYear(), start.getMonth(), start.getDate() - 1);
  }

  return arr(42, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
}

function setDate(date: Date, type: 'year' | 'month', value: number): Date {
  const newDate = new Date(date.getTime());
  newDate[type === 'year' ? 'setFullYear' : 'setMonth'](value);
  return newDate;
}

const isSameDay = (date1: Date, date2: Date) => date1.toISOString().split('T')[0] === date2.toISOString().split('T')[0];

const classNames = (...classes: (string | boolean)[]) => classes.filter(Boolean).join(" ")
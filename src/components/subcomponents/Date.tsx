import React from "react"

const DateFormatter: React.FC<{ updated?: boolean; date: string }> = ({
  updated,
  date,
}) => {
  const dateObject = new Date(date)
  return (
    <time
      dateTime={date.toString()}
      data-updated={updated && "true"}
      itemProp="datePublished"
    >
      {new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(dateObject)}
    </time>
  )
}

export default DateFormatter

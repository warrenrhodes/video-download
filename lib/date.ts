export class DateFormatter {
  private static readonly MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  public static formatDate(
    date: Date,
    format: "short" | "medium" | "long" | "us-style" = "medium"
  ): string {
    switch (format) {
      case "short":
        return this.formatShortDate(date);
      case "medium":
        return this.formatMediumDate(date);
      case "long":
        return this.formatLongDate(date);
      default:
        return this.formatUsStyleDate(date);
    }
  }

  private static formatShortDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
  }

  private static formatMediumDate(date: Date): string {
    const day = date.getDate();
    const month = DateFormatter.MONTHS[date.getMonth()];
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
  }

  private static formatLongDate(date: Date): string {
    const dayName = DateFormatter.getDayOfWeek(date);
    const day = date.getDate();
    const month = DateFormatter.MONTHS[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${month} ${day}, ${year}`;
  }

  private static formatUsStyleDate(date: Date): string {
    const month = DateFormatter.MONTHS[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
  }

  private static getDayOfWeek(date: Date): string {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.getDay()];
  }
}

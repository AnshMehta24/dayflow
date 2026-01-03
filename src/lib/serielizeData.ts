export function serialize(obj: any) {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      value?.constructor?.name === "Decimal" ? Number(value) : value
    )
  );
}

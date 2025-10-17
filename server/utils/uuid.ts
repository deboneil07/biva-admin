import short from "short-uuid";

export const generate_uuid = () => {
  const translator = short();
  const uuid = translator.new();
  console.log(uuid);
  return uuid;
};

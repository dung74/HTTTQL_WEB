const dataFormat = (input) => {
  const date = new Date(input);

  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const MM = String(date.getMonth() + 1).padStart(2, "0"); // Tháng tính từ 0
  const yyyy = date.getFullYear();

  return `${hh}:${mm} ${dd}/${MM}/${yyyy}`;
};

export default dataFormat;

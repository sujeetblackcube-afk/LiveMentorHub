export const getPaginatedData = async (model, queryOptions = {}, page = 1, limit = 10) => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const offset = (pageNum - 1) * limitNum;

  const options = {
    distinct: true,
    ...queryOptions,
    limit: limitNum,
    offset: offset,
  };

  const { count, rows } = await model.findAndCountAll(options);

  const totalPages = Math.ceil(count / limitNum);

  return {
    totalItems: count,
    totalPages,
    currentPage: pageNum,
    limit: limitNum,
    data: rows,
  };
};

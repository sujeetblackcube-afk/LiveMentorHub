/**
 * Reusable helper for paginated database queries using Sequelize.
 * 
 * @param {Object} model - The Sequelize model to query.
 * @param {Object} queryOptions - The query options (where, attributes, include, order, etc.).
 * @param {number|string} page - The current page number (default: 1).
 * @param {number|string} limit - The number of records to retrieve (default: 10).
 * @returns {Promise<Object>} - Paginated results with metadata.
 */
export const getPaginatedData = async (model, queryOptions = {}, page = 1, limit = 10) => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const offset = (pageNum - 1) * limitNum;

  const options = {
    ...queryOptions,
    limit: limitNum,
    offset: offset,
  };

  // findAndCountAll handles both fetching the paginated rows and the total count
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

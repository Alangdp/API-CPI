# Details

Date : 2023-07-28 20:15:42

Directory c:\\Users\\gabri\\Documents\\Projetos\\API-CPI

Total : 43 files,  2619 codes, 114 comments, 354 blanks, all 3087 lines

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [.eslintrc.cjs](/.eslintrc.cjs) | JavaScript | 23 | 0 | 1 | 24 |
| [.prettierrc](/.prettierrc) | JSON | 4 | 0 | 1 | 5 |
| [README.md](/README.md) | Markdown | 3 | 0 | 2 | 5 |
| [package.json](/package.json) | JSON | 43 | 0 | 1 | 44 |
| [src/app.js](/src/app.js) | JavaScript | 52 | 25 | 18 | 95 |
| [src/config/database.js](/src/config/database.js) | JavaScript | 18 | 0 | 4 | 22 |
| [src/controllers/stocksController.js](/src/controllers/stocksController.js) | JavaScript | 54 | 10 | 13 | 77 |
| [src/controllers/tokenController.js](/src/controllers/tokenController.js) | JavaScript | 18 | 1 | 7 | 26 |
| [src/controllers/userController.js](/src/controllers/userController.js) | JavaScript | 56 | 0 | 10 | 66 |
| [src/database/index.js](/src/database/index.js) | JavaScript | 16 | 2 | 5 | 23 |
| [src/database/migrations/20230711200900-users.cjs](/src/database/migrations/20230711200900-users.cjs) | JavaScript | 43 | 1 | 9 | 53 |
| [src/database/migrations/20230711210029-user_add_active_column.cjs](/src/database/migrations/20230711210029-user_add_active_column.cjs) | JavaScript | 13 | 1 | 2 | 16 |
| [src/database/migrations/20230711211143-user_add_password_column.cjs](/src/database/migrations/20230711211143-user_add_password_column.cjs) | JavaScript | 13 | 1 | 2 | 16 |
| [src/database/migrations/20230711211253-user_remaster.cjs](/src/database/migrations/20230711211253-user_remaster.cjs) | JavaScript | 20 | 1 | 4 | 25 |
| [src/database/migrations/20230715224122-users_chart.cjs](/src/database/migrations/20230715224122-users_chart.cjs) | JavaScript | 60 | 1 | 13 | 74 |
| [src/database/migrations/20230721021627-stocks.cjs](/src/database/migrations/20230721021627-stocks.cjs) | JavaScript | 44 | 1 | 8 | 53 |
| [src/database/migrations/20230721031211-stocks_change_companyName.cjs](/src/database/migrations/20230721031211-stocks_change_companyName.cjs) | JavaScript | 8 | 1 | 3 | 12 |
| [src/database/migrations/20230721031336-stocks_change_actualPrice.cjs](/src/database/migrations/20230721031336-stocks_change_actualPrice.cjs) | JavaScript | 8 | 1 | 3 | 12 |
| [src/database/migrations/20230721152343-stocks_change_tickeToUnique.cjs](/src/database/migrations/20230721152343-stocks_change_tickeToUnique.cjs) | JavaScript | 16 | 1 | 2 | 19 |
| [src/database/migrations/20230722024009-userChart_Constraint.cjs](/src/database/migrations/20230722024009-userChart_Constraint.cjs) | JavaScript | 11 | 1 | 2 | 14 |
| [src/database/migrations/20230725013726-Transations.cjs](/src/database/migrations/20230725013726-Transations.cjs) | JavaScript | 43 | 1 | 9 | 53 |
| [src/database/migrations/20230725015135-Transations_types_update.cjs](/src/database/migrations/20230725015135-Transations_types_update.cjs) | JavaScript | 11 | 1 | 2 | 14 |
| [src/database/migrations/20230725020342-Transations_date.cjs](/src/database/migrations/20230725020342-Transations_date.cjs) | JavaScript | 8 | 1 | 1 | 10 |
| [src/database/migrations/20230725021620-Transation_updated.cjs](/src/database/migrations/20230725021620-Transation_updated.cjs) | JavaScript | 9 | 1 | 2 | 12 |
| [src/database/migrations/20230726000344-Transation_typeCode.cjs](/src/database/migrations/20230726000344-Transation_typeCode.cjs) | JavaScript | 9 | 1 | 2 | 12 |
| [src/database/migrations/20230726000740-UserChart_medianPrice.cjs](/src/database/migrations/20230726000740-UserChart_medianPrice.cjs) | JavaScript | 6 | 1 | 2 | 9 |
| [src/database/migrations/20230728220926-ChartHistory.cjs](/src/database/migrations/20230728220926-ChartHistory.cjs) | JavaScript | 38 | 1 | 7 | 46 |
| [src/database/migrations/20230728225115-ChartHistory_total_and_created_updated.cjs](/src/database/migrations/20230728225115-ChartHistory_total_and_created_updated.cjs) | JavaScript | 21 | 1 | 4 | 26 |
| [src/json/stockDatas.json](/src/json/stockDatas.json) | JSON | 0 | 0 | 1 | 1 |
| [src/json/tickers.json](/src/json/tickers.json) | JSON | 989 | 0 | 0 | 989 |
| [src/middleware/adminMiddleware.js](/src/middleware/adminMiddleware.js) | JavaScript | 8 | 1 | 3 | 12 |
| [src/middleware/loginMiddleware.js](/src/middleware/loginMiddleware.js) | JavaScript | 16 | 1 | 5 | 22 |
| [src/models/HistoryChart.js](/src/models/HistoryChart.js) | JavaScript | 110 | 7 | 28 | 145 |
| [src/models/Stock.js](/src/models/Stock.js) | JavaScript | 113 | 3 | 19 | 135 |
| [src/models/Transation.js](/src/models/Transation.js) | JavaScript | 91 | 10 | 20 | 121 |
| [src/models/User.js](/src/models/User.js) | JavaScript | 97 | 3 | 12 | 112 |
| [src/models/UserChart.js](/src/models/UserChart.js) | JavaScript | 174 | 4 | 41 | 219 |
| [src/routes/stocksRouter.js](/src/routes/stocksRouter.js) | JavaScript | 10 | 0 | 5 | 15 |
| [src/routes/tokenRoutes.js](/src/routes/tokenRoutes.js) | JavaScript | 5 | 0 | 5 | 10 |
| [src/routes/userRoutes.js](/src/routes/userRoutes.js) | JavaScript | 9 | 0 | 5 | 14 |
| [src/server.js](/src/server.js) | JavaScript | 7 | 0 | 3 | 10 |
| [src/utils/controllersExtra.js](/src/utils/controllersExtra.js) | JavaScript | 17 | 0 | 4 | 21 |
| [src/utils/getFuncions.js](/src/utils/getFuncions.js) | JavaScript | 305 | 29 | 64 | 398 |

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)
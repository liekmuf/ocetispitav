const titles = [
  `Cписок устаткування, за яким закріплений Н робітник на ім'я "Джавелін Данило Володимирович"`,
  `Список договорів, які заключені з робітником на ім'я "Шувекович Григорій Степанович"`,
  `Знайти всіх робітників, чиє прізвище починається на букву Д`,
  `Знайти усе устаткування, в назві якого є рядок "GRINDEX"`,
  `Знайти усіх робітників, прийнятих на роботу у серпні 2021 року`,
  `Знайти усе устаткування, закуплене у період між 2022-01-01 та 2022-06-01`,
  `Скільки робітників було прийнято за поточний рік?`,
  `Скільки устаткування було закуплено за поточний рік?`,
  `скільки устаткування було закріплено за кожним робітником?`,
  `скільки договорів було заключено з кожним робітником?`,
  `у якій категорії знаходиться найбільша кількість устаткування?`,
  `у якого постачальника було проведено найбільше закупівель?`,
  `Cписок категорій, закупівлі устаткування у яких мали вартість вищу за середню у рамках своєї категорії`,
  `середня тривалість “просрочки” термінів закінчення ремонту устаткування для кожної категорії`,
  `Працівники, з якими не укладали контракт у Н році`,
  `Категорія устаткування, в якій не відбувалося закупівель протягом двох тижнів.`,
  `юніон “має максимальну кількість закріпленого устаткування” “не має в цей час закріпленого устаткування”`,
  `юніон “має максимальну кількість заключених договорів” “не має в цей час заключених договорів”`,
  `додаткові відомості про постачальника - “надав найбільшу кількість устаткування”`,
  `додаткові відомості про працівника - “заключено найбільшу кількість договорів”`,
]

const queries = [
  `SELECT workers.worker_name, equip.equip_name
  FROM (SELECT worker.worker_id, worker.worker_name, pin.pin_id
  FROM worker
  JOIN pin
  ON pin.worker_id = worker.worker_id) AS workers
  JOIN (SELECT equipment.equip_id, equipment.equip_name, pin.pin_id
  FROM equipment
  JOIN pin
  ON pin.equip_id = equipment.equip_id) AS equip
  ON equip.pin_id = workers.pin_id
  WHERE worker_name = 'Джавелін Данило Володимирович';`,

  `SELECT workers.worker_name, work_contract.contract_id
  FROM (
    SELECT worker.worker_id, worker.worker_name, work_contract.contract_id 
    FROM worker 
    JOIN work_contract 
    ON work_contract.worker_id = worker.worker_id
    ) AS workers
  JOIN work_contract
  ON work_contract.contract_id = workers.contract_id
  WHERE workers.worker_name = 'Островська Дарія Сергіївна'
  ORDER BY work_contract.contract_id;`,

  `SELECT *
  FROM worker
  WHERE worker.worker_name
  LIKE "Д%";`,

  `SELECT *
  FROM equipment
  WHERE equipment.equip_name
  LIKE "%GRINDEX%";`,

  `SELECT worker.*
  FROM worker
  JOIN (
    SELECT *
    FROM work_contract
    WHERE MONTH(contract_date) = 8 AND YEAR(contract_date) = 2021
  ) AS contracts
  ON contracts.worker_id = worker.worker_id;`,

  `SELECT equipment.*
  FROM equipment
  JOIN (
    SELECT *
    FROM purchase
    WHERE purchase_date >= '2022-01-01' AND purchase_date <= '2022-06-01'
  ) AS purchases
  ON purchases.equip_id = equipment.equip_id;`,

  `SELECT COUNT(*) FROM (SELECT DISTINCT worker_id FROM work_contract WHERE DATE_FORMAT(contract_date, '%Y') = DATE_FORMAT(CURDATE() , '%Y')) as some_table`,

  `SELECT COUNT(*) FROM purchase WHERE DATE_FORMAT(purchase_date, '%Y') = DATE_FORMAT(CURDATE() , '%Y')`,

  `SELECT category_name, COUNT(*) as c FROM category JOIN equipment USING(category_id) 
  HAVING c >= ALL
  (SELECT COUNT(*) FROM category JOIN equipment USING(category_id));`,

  `SELECT supplier_name, COUNT(*) as c FROM purchase JOIN supplier USING(supplier_id)
  HAVING c >= ALL
  (SELECT COUNT(*) as c FROM purchase JOIN supplier USING(supplier_id));`,

  `SELECT category_name FROM (SELECT * FROM category JOIN equipment USING(category_id) JOIN purchase USING(equip_id)) t1 WHERE t1.cost > (SELECT(AVG(t2.cost))
  FROM (SELECT * FROM category JOIN equipment USING(category_id) JOIN purchase USING(equip_id)) t2 WHERE t1.category_id = t2.category_id);`,

  `SELECT equip_name FROM (SELECT * FROM equipment JOIN repairment USING(equip_id)) t1 WHERE
  (SELECT(IF(t1.fact_end IS NULL, datediff(curdate(), t1.fact_start),
  datediff(t1.fact_end, t1.fact_start))))
  > (SELECT(AVG((IF(t2.fact_end IS NULL, datediff(curdate(), t2.fact_start),
  datediff(t2.fact_end, t2.fact_start)))))
  FROM (SELECT * FROM equipment JOIN repairment USING(equip_id)) t2 WHERE t1.category_id = t2.category_id);
  `,

  `SELECT worker_name FROM worker WHERE worker_id NOT IN
  (SELECT worker_id FROM worker LEFT JOIN work_contract USING(worker_id) WHERE DATE_FORMAT(contract_date, '%Y') = '2022');
  `,

  `SELECT category_name FROM category WHERE category_id NOT IN
  (SELECT category_id FROM equipment LEFT JOIN purchase USING(equip_id) WHERE purchase_date > curdate()-14);`,
]

module.exports = {
  titles,
  queries,
}

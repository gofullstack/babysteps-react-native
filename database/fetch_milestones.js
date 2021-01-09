import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('babysteps.db');

const fetchMilestones = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT DISTINCT 
            t.id,
            t.milestone_id,
            m.milestone_group_id,
            mg.title AS milestone_group,
            mg.position AS milestone_group_position,
            m.position AS milestone_position,
            t.position,
            m.title AS milestone_title,
            m.message AS milestone_message,
            m.always_visible,
            m.notify,
            t.task_type,
            t.study_only,
            t.baby_book,
            t.name
          FROM milestones AS m
          INNER JOIN milestone_groups AS mg
            ON mg.id = m.milestone_group_id
          INNER JOIN tasks AS t 
            ON m.id = t.milestone_id
          ORDER BY mg.position, m.position, t.position;`,
        [],
        (_, response) =>resolve( response.rows ),
        (_, err) => reject( err )
      );
    });
  });
};

export default fetchMilestones;

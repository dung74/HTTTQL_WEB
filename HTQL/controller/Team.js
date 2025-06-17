import { Op } from "sequelize";
import db from "../models/index.js";

const createTeam = async (req, res) => {
  const { name, manager_id, members } = req.body;
  try {
    const team = await db.teams.findOne({
      where: {
        name,
        manager_id,
      },
    });
    if (team) {
      return res.status(400).json({ message: "Team đã tồn tại" });
    }

    const newTeam = await db.teams.create({
      name,
      manager_id,
    });
    // const userManager = await db.managers.findByPk(manager_id);
    await db.users.update(
      {
        team_id: newTeam.id,
      },
      {
        where: {
          id: manager_id,
        },
      }
    );
    // for (let i = 0; i < members.length; i++) {
    //   // const member = members[i];
    //   // await db.team_members.create({
    //   //     team_id: newTeam.id,
    //   //     user_id: member,
    //   // });
    //   try {
    //     await db.users.update(
    //       { team_id: newTeam.id },
    //       {
    //         where: {
    //           id: members[i],
    //         },
    //       }
    //     );
    //   } catch (error) {
    //     console.log(error);
    //     return res
    //       .status(500)
    //       .json({ message: "Lỗi khi thêm thành viên vào team", error });
    //   }
    // }

    res.status(201).json({
      message: "Tạo team thành công",
      data: newTeam,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo team", error });
  }
};

const deleteTeam = async (req, res) => {
  const { id } = req.params;
  try {
    const team = await db.teams.findOne({
      where: {
        id,
      },
    });
    if (!team) {
      return res.status(404).json({ message: "Team không tồn tại" });
    }
    await db.teams.destroy({
      where: {
        id,
      },
    });
    res.status(200).json({ message: "Xóa team thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa team", error });
  }
};

const getAllTeams = async (req, res) => {
  let { page = 1, keyword } = req.query;
  page === "" ? (page = 1) : (page = parseInt(page));
  const limit = 10;
  const offset = (page - 1) * limit;
  const searchCondition = keyword
    ? {
        name: {
          [Op.like]: `%${keyword}%`,
        },
      }
    : {};
  try {
    const teams = await db.teams.findAll({
      attributes: ["id", "name", "manager_id"],
      where: { ...searchCondition },
      limit,
      offset,
    });
    const count = await db.teams.findAll({
      attributes: ["id", "name", "manager_id"],
      where: { ...searchCondition },
    });
    const totalTeams = count.length;
    const totalPage = Math.ceil(totalTeams / limit);

    const teamsRes = await Promise.all(
      teams.map(async (team) => {
        const user = await db.users.findByPk(team.manager_id, {
          attributes: ["username", "fullname"],
        });
        return {
          id: team.id,
          name: team.name,
          manager: user?.fullname || null,
          username: user?.username || null,
        };
      })
    );

    return res.status(200).json({
      message: "Thành công",
      data: teamsRes,
      currentPage: page,
      totalPage: totalPage,
      totalTeams: totalTeams,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi lấy danh sách teams",
      error,
    });
  }
};

const getTeamById = async (req, res) => {
  const { id } = req.params;
  try {
    const team = await db.teams.findOne({
      where: {
        id,
      },
      include: [
        {
          model: db.managers,
          as: "manager",
          include: [
            {
              model: db.users,
              as: "user",
              attributes: ["username", "fullname"],
            },
          ],
        },
      ],
    });
    if (!team) {
      return res.status(404).json({ message: "Team không tồn tại" });
    }

    const members = await db.users.findAll({
      where: {
        team_id: id,
      },
      attributes: ["id", "username", "fullname"],
    });

    res.status(200).json({ team, members });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy team", error });
  }
};

const updateTeam = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Thiếu id team" });
  }
  const { name, manager_id } = req.body;
  const team = await db.teams.findByPk(id);
  if (!team) {
    return res.status(404).json({ message: "Team không tồn tại" });
  }
  await team.update({
    name,
    manager_id,
  });
  const oldManagerId = team.manager_id;
  if (manager_id) {
    await db.users.update(
      {
        team_id: null,
      },
      {
        where: {
          id: oldManagerId,
        },
      }
    );
    await db.users.update(
      {
        team_id: team.id,
      },
      {
        where: {
          id: manager_id,
        },
      }
    );
  }
  return res.status(200).json({
    message: "Cập nhật team thành công",
    data: team,
  });
};

export { createTeam, deleteTeam, getAllTeams, getTeamById, updateTeam };

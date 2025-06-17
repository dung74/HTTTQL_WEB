import React, { useState } from 'react';

function TeamForm({ token }) {
  const [teamName, setTeamName] = useState('');
  const [managerId, setManagerId] = useState('');
  const [memberIds, setMemberIds] = useState('');

  const handleCreateTeam = (e) => {
    e.preventDefault();
    console.log('Tạo team:', { teamName, managerId, memberIds });
    alert('Tạo team thành công (giả lập)!');
  };

  return (
    <div>
      <h3>Tạo Team</h3>
      <form onSubmit={handleCreateTeam}>
        <input
          type="text"
          placeholder="Tên team"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Manager ID"
          value={managerId}
          onChange={(e) => setManagerId(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Danh sách member ID (cách nhau bởi dấu phẩy)"
          value={memberIds}
          onChange={(e) => setMemberIds(e.target.value)}
          required
        />
        <button type="submit">Tạo Team</button>
      </form>
    </div>
  );
}

export default TeamForm;
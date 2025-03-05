import { useState, useEffect } from "react";

const TopicSelect = ({ onChange }) => {
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    // 📌 ดึงข้อมูลจาก API
    const fetchTopics = async () => {
      try {
        const res = await fetch("/api/topics/option");
        const data = await res.json();
        setTopics(data);
      } catch (error) {
        console.error("❌ Error fetching topics:", error);
      }
    };

    fetchTopics();
  }, []);

  return (
    <select id="swal-topicId" onChange={onChange} className="w-full p-2 border border-gray-300 rounded-lg">
      {topics.map((topic) => (
        <option key={topic.id} value={topic.id}>
          {topic.name}
        </option>
      ))}
    </select>
  );
};

export default TopicSelect;

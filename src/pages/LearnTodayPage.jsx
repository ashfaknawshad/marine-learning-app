import { useState } from 'react';

export default function LearnTodayPage() {
  const [department, setDepartment] = useState('');
  const [module, setModule] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newModule, setNewModule] = useState('');
  const [learnedText, setLearnedText] = useState('');
  const [image, setImage] = useState(null);

  const departments = ['Marine Biology', 'Fisheries', 'Aquaculture'];
  const modules = ['Coral Reefs', 'Fish ID', 'Lab Techniques'];

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      department: newDepartment || department,
      module: newModule || module,
      learnedText,
      image,
    };
    console.log('Submitted:', payload);
    alert("Submitted successfully! (Check console for now)");
  };

  return (
    <div className="p-4 max-w-xl mx-auto bg-white shadow-xl rounded-2xl">
      <h2 className="text-2xl font-bold mb-4">🧠 What I Learned Today</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Department selection */}
        <div>
          <label className="block mb-1 font-semibold">Department</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
          >
            <option value="">-- Select Department --</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Or type new department"
            value={newDepartment}
            onChange={(e) => setNewDepartment(e.target.value)}
            className="w-full border mt-2 rounded p-2"
          />
        </div>

        {/* Module selection */}
        <div>
          <label className="block mb-1 font-semibold">Module</label>
          <select
            value={module}
            onChange={(e) => setModule(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
          >
            <option value="">-- Select Module --</option>
            {modules.map((mod) => (
              <option key={mod} value={mod}>{mod}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Or type new module"
            value={newModule}
            onChange={(e) => setNewModule(e.target.value)}
            className="w-full border mt-2 rounded p-2"
          />
        </div>

        {/* Learned text input */}
        <div>
          <label className="block mb-1 font-semibold">What did you learn?</label>
          <textarea
            value={learnedText}
            onChange={(e) => setLearnedText(e.target.value)}
            placeholder="Describe what you learned..."
            className="w-full border rounded p-2 h-24"
          />
        </div>

        {/* Image upload */}
        <div>
          <label className="block mb-1 font-semibold">Optional Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';
import storageService from '../services/storage';

function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [editingGoal, setEditingGoal] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const data = await storageService.getGoals();
      setGoals(data);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const handleCreateGoal = () => {
    if (goals.length >= 3) {
      alert('Maximum 3 goals allowed');
      return;
    }
    setEditingGoal({
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      deadline: '',
      history: []
    });
    setIsCreating(true);
  };

  const handleSaveGoal = async () => {
    if (!editingGoal.name.trim() || editingGoal.targetAmount <= 0) {
      alert('Please enter a valid name and target amount');
      return;
    }

    let updatedGoals;
    if (isCreating) {
      const newGoal = {
        id: Date.now(),
        ...editingGoal,
        createdAt: new Date().toISOString(),
        history: [{ date: new Date().toISOString(), amount: editingGoal.currentAmount }]
      };
      updatedGoals = [...goals, newGoal];
    } else {
      updatedGoals = goals.map(g => 
        g.id === editingGoal.id ? editingGoal : g
      );
    }

    await storageService.saveGoals(updatedGoals);
    await loadGoals();
    setEditingGoal(null);
    setIsCreating(false);
  };

  const handleUpdateAmount = async (goalId, newAmount) => {
    const updatedGoals = goals.map(g => {
      if (g.id === goalId) {
        const updatedAmount = g.currentAmount + newAmount; // Add to current amount
        return {
          ...g,
          currentAmount: updatedAmount,
          history: [...(g.history || []), { date: new Date().toISOString(), amount: updatedAmount }]
        };
      }
      return g;
    });

    await storageService.saveGoals(updatedGoals);
    await loadGoals();
  };

  const handleDeleteGoal = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      const updatedGoals = goals.filter(g => g.id !== goalId);
      await storageService.saveGoals(updatedGoals);
      await loadGoals();
    }
  };

  const getProgress = (goal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const days = differenceInDays(parseISO(deadline), new Date());
    return days;
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Financial Goals</h1>
          <p className="text-gray-600 mt-1">Track your savings progress</p>
        </div>
        {goals.length < 3 && (
          <button
            onClick={handleCreateGoal}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
          >
            + New Goal
          </button>
        )}
      </div>

      {goals.length === 0 && !editingGoal ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-4">No financial goals yet</p>
          <button
            onClick={handleCreateGoal}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {goals.map(goal => (
            <div key={goal.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{goal.name}</h2>
                  {goal.deadline && (
                    <p className="text-sm text-gray-600 mt-1">
                      {getDaysRemaining(goal.deadline) > 0
                        ? `${getDaysRemaining(goal.deadline)} days remaining`
                        : getDaysRemaining(goal.deadline) === 0
                        ? 'Due today!'
                        : `${Math.abs(getDaysRemaining(goal.deadline))} days overdue`
                      }
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingGoal(goal);
                      setIsCreating(false);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Target</p>
                  <p className="text-2xl font-bold text-gray-800">
                    ${goal.targetAmount.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Current</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${goal.currentAmount.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Remaining</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ${Math.max(0, goal.targetAmount - goal.currentAmount).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{getProgress(goal).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${getProgress(goal)}%` }}
                  ></div>
                </div>
              </div>

              {/* Quick Update */}
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Add amount (e.g., 100)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateAmount(goal.id, parseFloat(e.target.value) || 0);
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = e.target.previousSibling;
                    handleUpdateAmount(goal.id, parseFloat(input.value) || 0);
                    input.value = '';
                  }}
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Add
                </button>
              </div>

              {/* Simple History Chart */}
              {goal.history && goal.history.length > 1 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-3">Progress History</h3>
                  <div className="h-32 flex items-end gap-1">
                    {goal.history.slice(-10).map((entry, index) => {
                      const height = (entry.amount / goal.targetAmount) * 100;
                      return (
                        <div
                          key={index}
                          className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors group relative"
                          style={{ height: `${Math.min(height, 100)}%` }}
                          title={`${format(parseISO(entry.date), 'MMM d')}: $${entry.amount}`}
                        >
                          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                            ${entry.amount}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>{format(parseISO(goal.history[0].date), 'MMM d')}</span>
                    <span>{format(parseISO(goal.history[goal.history.length - 1].date), 'MMM d')}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      {editingGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {isCreating ? 'Create New Goal' : 'Edit Goal'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={editingGoal.name}
                  onChange={(e) => setEditingGoal({ ...editingGoal, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Emergency Fund"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Amount ($)
                </label>
                <input
                  type="number"
                  value={editingGoal.targetAmount}
                  onChange={(e) => setEditingGoal({ ...editingGoal, targetAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Amount ($)
                </label>
                <input
                  type="number"
                  value={editingGoal.currentAmount}
                  onChange={(e) => setEditingGoal({ ...editingGoal, currentAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={editingGoal.deadline}
                  onChange={(e) => setEditingGoal({ ...editingGoal, deadline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveGoal}
                  className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium"
                >
                  {isCreating ? 'Create Goal' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setEditingGoal(null);
                    setIsCreating(false);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GoalsPage;
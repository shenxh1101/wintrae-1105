import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Plus, User, Crown, Dumbbell, Eye, Edit2, Trash2, Check, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePetStore } from '../stores/usePetStore';
import Header from '../components/Header';
import type { FamilyMember } from '../types';

type MemberRole = 'owner' | 'trainer' | 'viewer';

const AVATAR_COLORS = ['#FF8C42', '#6BCB77', '#4D96FF', '#FF6B6B', '#B983FF', '#FFD93D'];

const roleConfig: Record<MemberRole, { label: string; icon: typeof Crown; color: string; bgColor: string; description: string }> = {
  owner: {
    label: '主人',
    icon: Crown,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    description: '完全权限',
  },
  trainer: {
    label: '训练师',
    icon: Dumbbell,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: '可以训练打卡',
  },
  viewer: {
    label: '观察者',
    icon: Eye,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: '仅查看',
  },
};

const FamilyPage = () => {
  const navigate = useNavigate();
  const {
    familyMembers,
    currentMemberId,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    setCurrentMember,
  } = usePetStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<FamilyMember | null>(null);

  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<MemberRole>('viewer');
  const [formColor, setFormColor] = useState(AVATAR_COLORS[0]);

  const openAddModal = () => {
    setFormName('');
    setFormRole('viewer');
    setFormColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
    setShowAddModal(true);
  };

  const openEditModal = (member: FamilyMember) => {
    setEditingMember(member);
    setFormName(member.name);
    setFormRole(member.role);
    setFormColor(member.color);
    setShowEditModal(true);
  };

  const openDeleteConfirm = (member: FamilyMember) => {
    setDeletingMember(member);
    setShowDeleteConfirm(true);
  };

  const handleAddMember = () => {
    if (!formName.trim()) return;
    addFamilyMember({
      name: formName.trim(),
      role: formRole,
      color: formColor,
    });
    setShowAddModal(false);
  };

  const handleEditMember = () => {
    if (!editingMember || !formName.trim()) return;
    updateFamilyMember(editingMember.id, {
      name: formName.trim(),
      role: formRole,
      color: formColor,
    });
    setShowEditModal(false);
    setEditingMember(null);
  };

  const handleDeleteMember = () => {
    if (!deletingMember) return;
    deleteFamilyMember(deletingMember.id);
    if (currentMemberId === deletingMember.id && familyMembers.length > 1) {
      const remaining = familyMembers.find(m => m.id !== deletingMember.id);
      if (remaining) setCurrentMember(remaining.id);
    }
    setShowDeleteConfirm(false);
    setDeletingMember(null);
  };

  const roleOptions: MemberRole[] = ['owner', 'trainer', 'viewer'];

  return (
    <div className="pb-6 min-h-screen bg-neutral-50">
      <Header
        title="家庭成员"
        showBack
        rightAction={
          <button
            onClick={openAddModal}
            className="p-2 -mr-2 text-primary-500 hover:bg-primary-50 rounded-full"
          >
            <Plus size={22} />
          </button>
        }
      />

      <div className="px-4">
        {/* 角色说明 */}
        <div className="bg-white rounded-2xl p-4 shadow-card mb-6">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">角色说明</h3>
          <div className="space-y-2.5">
            {roleOptions.map((role) => {
              const config = roleConfig[role];
              const Icon = config.icon;
              return (
                <div key={role} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                    <Icon size={16} className={config.color} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-800">{config.label}</p>
                    <p className="text-xs text-neutral-500">{config.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 成员列表 */}
        {familyMembers.length > 0 ? (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {familyMembers.map((member) => {
                const isCurrent = member.id === currentMemberId;
                const config = roleConfig[member.role];
                const RoleIcon = config.icon;
                return (
                  <motion.div
                    key={member.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCurrentMember(member.id)}
                      className={`bg-white rounded-2xl p-4 shadow-card cursor-pointer transition-all relative overflow-hidden ${
                        isCurrent ? 'ring-2 ring-primary-400 ring-offset-2' : ''
                      }`}
                    >
                      {isCurrent && (
                        <div className="absolute top-0 right-0 bg-gradient-to-bl from-primary-400 to-primary-500 text-white px-3 py-1 rounded-bl-2xl">
                          <Crown size={14} className="inline mr-1" />
                          <span className="text-xs font-medium">当前</span>
                        </div>
                      )}

                      <div className="flex items-center gap-4">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md relative"
                          style={{ backgroundColor: member.color }}
                        >
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-full h-full rounded-2xl object-cover"
                            />
                          ) : (
                            member.name.charAt(0)
                          )}
                          {isCurrent && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center border-2 border-white">
                              <Check size={10} className="text-white" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-neutral-800 truncate">{member.name}</h3>
                            {isCurrent && (
                              <div className={`w-5 h-5 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                                <RoleIcon size={12} className={config.color} />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
                              <RoleIcon size={12} />
                              {config.label}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(member);
                            }}
                            className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-primary-50 hover:text-primary-500 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (familyMembers.length <= 1) return;
                              openDeleteConfirm(member);
                            }}
                            disabled={familyMembers.length <= 1}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                              familyMembers.length <= 1
                                ? 'bg-neutral-100 text-neutral-300 cursor-not-allowed'
                                : 'bg-neutral-100 text-neutral-500 hover:bg-red-50 hover:text-red-500'
                            }`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto bg-neutral-100 rounded-full flex items-center justify-center mb-4">
              <User size={32} className="text-neutral-300" />
            </div>
            <p className="text-neutral-500 mb-2">还没有添加家庭成员</p>
            <p className="text-neutral-400 text-sm mb-6">邀请家人一起照顾宠物</p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-full font-medium active:scale-95 transition-transform shadow-lg shadow-primary-200"
            >
              <Plus size={18} />
              添加第一位成员
            </button>
          </div>
        )}
      </div>

      {/* 添加成员弹窗 */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end z-50"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full bg-white rounded-t-3xl p-6 safe-area-bottom text-neutral-800 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold">添加家庭成员</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">名字</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="输入成员名字"
                    className="w-full px-4 py-3 bg-neutral-50 rounded-xl border-2 border-neutral-100 focus:border-primary-300 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">角色</label>
                  <div className="space-y-2">
                    {roleOptions.map((role) => {
                      const config = roleConfig[role];
                      const Icon = config.icon;
                      const isSelected = formRole === role;
                      return (
                        <button
                          key={role}
                          onClick={() => setFormRole(role)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? 'border-primary-300 bg-primary-50'
                              : 'border-neutral-100 bg-neutral-50 hover:bg-neutral-100'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bgColor}`}>
                            <Icon size={18} className={config.color} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-neutral-800">{config.label}</p>
                            <p className="text-xs text-neutral-500">{config.description}</p>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                              <Check size={14} className="text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">头像颜色</label>
                  <div className="flex flex-wrap gap-3">
                    {AVATAR_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setFormColor(color)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          formColor === color ? 'ring-4 ring-offset-2 ring-primary-300 scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {formName && formColor === color && (
                          <span className="text-white font-bold text-lg">{formName.charAt(0)}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddMember}
                disabled={!formName.trim()}
                className={`w-full py-3.5 mt-6 rounded-xl font-semibold transition-all ${
                  formName.trim()
                    ? 'bg-primary-500 text-white active:scale-[0.98] shadow-lg shadow-primary-200'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                }`}
              >
                添加成员
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 编辑成员弹窗 */}
      <AnimatePresence>
        {showEditModal && editingMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end z-50"
            onClick={() => {
              setShowEditModal(false);
              setEditingMember(null);
            }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full bg-white rounded-t-3xl p-6 safe-area-bottom text-neutral-800 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold">编辑成员</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingMember(null);
                  }}
                  className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">名字</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="输入成员名字"
                    className="w-full px-4 py-3 bg-neutral-50 rounded-xl border-2 border-neutral-100 focus:border-primary-300 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">角色</label>
                  <div className="space-y-2">
                    {roleOptions.map((role) => {
                      const config = roleConfig[role];
                      const Icon = config.icon;
                      const isSelected = formRole === role;
                      return (
                        <button
                          key={role}
                          onClick={() => setFormRole(role)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? 'border-primary-300 bg-primary-50'
                              : 'border-neutral-100 bg-neutral-50 hover:bg-neutral-100'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bgColor}`}>
                            <Icon size={18} className={config.color} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-neutral-800">{config.label}</p>
                            <p className="text-xs text-neutral-500">{config.description}</p>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                              <Check size={14} className="text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">头像颜色</label>
                  <div className="flex flex-wrap gap-3">
                    {AVATAR_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setFormColor(color)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          formColor === color ? 'ring-4 ring-offset-2 ring-primary-300 scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {formName && formColor === color && (
                          <span className="text-white font-bold text-lg">{formName.charAt(0)}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleEditMember}
                disabled={!formName.trim()}
                className={`w-full py-3.5 mt-6 rounded-xl font-semibold transition-all ${
                  formName.trim()
                    ? 'bg-primary-500 text-white active:scale-[0.98] shadow-lg shadow-primary-200'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                }`}
              >
                保存修改
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 删除确认弹窗 */}
      <AnimatePresence>
        {showDeleteConfirm && deletingMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
            onClick={() => {
              setShowDeleteConfirm(false);
              setDeletingMember(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 size={28} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-neutral-800 text-center mb-2">
                确定删除「{deletingMember.name}」吗？
              </h3>
              <p className="text-neutral-500 text-center text-sm mb-6">
                删除后该成员将无法再管理宠物，此操作无法撤销
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletingMember(null);
                  }}
                  className="flex-1 py-3 bg-neutral-100 text-neutral-600 rounded-xl font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleDeleteMember}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium"
                >
                  删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FamilyPage;

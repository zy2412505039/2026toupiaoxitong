import { useState, useEffect } from 'react'
import { Card, Space, Select, Tag, Progress, Input, Button, List, Checkbox, Empty } from 'antd'
import { ProjectOutlined, PlusOutlined, DeleteOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'

export default function Tasks({ projectList, onAddTask, onToggleTask, onDeleteTask }) {
  const [currentProjectId, setCurrentProjectId] = useState('')
  const [taskInput, setTaskInput] = useState('')

  // 自动选中第一个项目
  useEffect(() => {
    if (projectList.length > 0) {
      setCurrentProjectId(projectList[0].id)
    }
  }, [projectList])

  const currentProject = projectList.find(p => p.id === currentProjectId) || {}
  const tasks = currentProject?.tasks || []

  // 统计
  const totalCount = tasks.length
  const completedCount = tasks.filter(t => t.completed).length
  const percent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)

  // 切换项目下拉
  const handleProjectChange = (val) => {
    setCurrentProjectId(val)
  }

  // 创建任务
  const handleCreateTask = () => {
    const trimTitle = taskInput.trim()
    if (!trimTitle) return
    onAddTask(currentProjectId, trimTitle)
    setTaskInput('')
  }

  // 切换勾选状态
  const handleToggle = (taskId) => {
    onToggleTask(currentProjectId, taskId)
  }

  // 删除任务
  const handleDelete = (taskId) => {
    onDeleteTask(currentProjectId, taskId)
  }

  return (
    <div className="renwuguanli">
      {/* 1. 顶部操作栏与项目选择器 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>任务管理清单</h2>
          <span style={{ color: '#8c8c8c', fontSize: '13px' }}>
            拆解实训阶段目标，标间完成情况并实时统计进度
          </span>
        </div>
        {/* 项目下拉选择器 */}
        <Space>
          <span style={{ fontSize: '14px', color: '#595959', fontWeight: 500 }}>
            <ProjectOutlined style={{ marginRight: 6 }} />
            切换所属项目：
          </span>
          <Select
            value={currentProjectId}
            onChange={handleProjectChange}
            style={{ width: 260 }}
            options={projectList.map((item) => ({
              label: item.name,
              value: item.id
            }))}
          ></Select>
        </Space>
      </div>

      {/* 2. 当前选中项目的基本信息与实时进度看板 */}
      <Card
        style={{ marginBottom: '20px', background: '#fafafa', border: '1px solid #f0f0f0' }}
        bodyStyle={{ padding: '20px' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div>
            <span style={{ fontSize: '16px', fontWeight: 'bold', marginRight: '10px' }}>
              {currentProject.name}
            </span>
            <Tag color="blue">{currentProject.course}</Tag>
          </div>
          <div style={{ fontSize: '15px', color: '#8c8c8c' }}>
            <span>总任务：<b>{totalCount}</b> 项</span>
            <span style={{ margin: '0 8px' }}>|</span>
            <span style={{ color: '#52c41a' }}>已完成：<b>{completedCount}</b> 项</span>
            <span style={{ margin: '0 8px' }}>|</span>
            <span style={{ color: '#faad14' }}>待推进：<b>{totalCount - completedCount}</b> 项</span>
          </div>
        </div>
        <Progress
          percent={percent}
          status={percent >= 100 ? 'success' : 'active'}
          strokeColor={{ '0%': '#108ee9', '100%': '#52c41a' }}
        />
      </Card>

      {/* 3. 极简任务快速录入输入框 */}
      <Space.Compact style={{ width: '100%', marginBottom: '20px' }}>
        <Input
          size="large"
          placeholder="输入实训待办任务，例如：完成前端页面开发与组件封装（支持按 Enter 回车键添加）"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          onPressEnter={handleCreateTask}
        />
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleCreateTask}>
          添加任务
        </Button>
      </Space.Compact>

      {/* 4. 任务清单列表 */}
      <Card title="实训待办任务列表" style={{ border: '1px solid #f0f0f0' }}>
        {tasks.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="当前项目还没有任何任务，快在上方输入框添加一个吧！"
          />
        ) : (
          <List
            dataSource={tasks}
            renderItem={(task) => (
              <List.Item
                key={task.id}
                actions={[
                  <Button
                    key="delete"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(task.id)}
                  >
                    删除
                  </Button>
                ]}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  {/* 完成状态勾选框 */}
                  <Checkbox checked={task.completed} onChange={() => handleToggle(task.id)} />
                  {/* 任务名称（已完成添加横线划掉和灰色弱化） */}
                  <span
                    style={{
                      fontSize: '14px',
                      color: task.completed ? '#8c8c8c' : '#262626',
                      textDecoration: task.completed ? 'line-through' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    {task.title}
                  </span>
                  {/* 状态徽标 Tag */}
                  {task.completed ? (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                      已完成
                    </Tag>
                  ) : (
                    <Tag icon={<ClockCircleOutlined />} color="warning">
                      进行中
                    </Tag>
                  )}
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  )
}

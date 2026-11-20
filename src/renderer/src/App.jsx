import { useState, useEffect } from 'react'
import { Layout } from 'antd'

// 导入业务组件与样式
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Tasks from './pages/Tasks'
import './App.css'

const { Header, Content } = Layout

export default function App() {
  // 当前选中的菜单项
  const [current, setCurrent] = useState('dashboard')

  // 1. 项目数据源（第五节课改为从本地 JSON 文件异步恢复，不再写死假数据）
  const [projects, setProjects] = useState([])

  // 启动时从 Electron 主进程加载本地持久化数据
  useEffect(() => {
    const jiazaiBendiShuju = async () => {
      if (!window.api?.loadData) {
        console.log('-------', '当前环境未挂载 Electron API，跳过本地读取')
        return
      }
      try {
        const bendiShuju = await window.api.loadData()
        console.log('+++++++', '启动读取本地数据成功，项目数：', bendiShuju?.length)
        if (Array.isArray(bendiShuju)) {
          setProjects(bendiShuju)
        }
      } catch (err) {
        console.log('-------', '读取本地数据失败：', err)
      }
    }

    jiazaiBendiShuju()
  }, [])

  // 统一更新状态并同步持久化到本地磁盘
  const gengxinBingBaocun = async (zuixinLiebiao) => {
    setProjects(zuixinLiebiao)
    if (!window.api?.saveData) {
      return
    }
    try {
      const jieguo = await window.api.saveData(zuixinLiebiao)
      console.log('=======', '本地数据持久化保存结果：', jieguo)
    } catch (err) {
      console.log('=======', '本地数据保存失败：', err)
    }
  }

  // 2. 新增项目处理函数
  const handleAddProject = (newProject) => {
    console.log('-------', '主组件接收到新项目：', newProject)
    const projectWithTasks = {
      ...newProject,
      tasks: newProject.tasks || []
    }
    const zuixinLiebiao = [projectWithTasks, ...projects]
    gengxinBingBaocun(zuixinLiebiao)
  }

  // 3. 新增任务处理函数
  const handleAddTask = (projectId, taskTitle) => {
    console.log('-------', '主组件接收到新增任务：', { projectId, taskTitle })
    const newTask = {
      id: `t_${Date.now()}`,
      title: taskTitle,
      completed: false
    }
    const zuixinLiebiao = projects.map((item) => {
      if (item.id === projectId) {
        return {
          ...item,
          tasks: [...(item.tasks || []), newTask]
        }
      }
      return item
    })
    gengxinBingBaocun(zuixinLiebiao)
  }

  // 4. 切换任务完成状态（勾选 / 取消勾选）
  const handleToggleTask = (projectId, taskId) => {
    console.log('-------', '主组件切换任务完成状态：', { projectId, taskId })
    const zuixinLiebiao = projects.map((item) => {
      if (item.id === projectId) {
        return {
          ...item,
          tasks: (item.tasks || []).map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
        }
      }
      return item
    })
    gengxinBingBaocun(zuixinLiebiao)
  }

  // 5. 删除任务处理函数
  const handleDeleteTask = (projectId, taskId) => {
    console.log('-------', '主组件删除任务：', { projectId, taskId })
    const zuixinLiebiao = projects.map((item) => {
      if (item.id === projectId) {
        return {
          ...item,
          tasks: (item.tasks || []).filter((task) => task.id !== taskId)
        }
      }
      return item
    })
    gengxinBingBaocun(zuixinLiebiao)
  }

  // 接收菜单切换事件
  const handleMenuChange = (key) => {
    console.log('-------', '切换主菜单选项：', key)
    setCurrent(key)
  }

  return (
    <Layout className="zhuomianbuju">
      {/* 1. 左侧独立菜单组件 */}
      <Sidebar current={current} onMenuChange={handleMenuChange} />

      {/* 2. 右侧主体区域 */}
      <Layout>
        {/* 顶部标题栏 */}
        <Header className="dingbutoubu">
          <span>USY 项目制教学桌面工作平台</span>
        </Header>

        {/* 内容主体卡片 */}
        <Content className="neirongquyu">
          {current === 'dashboard' && (
            <Dashboard projectList={projects} onMenuChange={handleMenuChange} />
          )}
          {current === 'projects' && (
            <Projects projectList={projects} onAddProject={handleAddProject} />
          )}
          {current === 'tasks' && (
            <Tasks
              projectList={projects}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
            />
          )}
        </Content>
      </Layout>
    </Layout>
  )
}

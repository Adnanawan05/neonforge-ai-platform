import { create } from 'zustand'

export type Job = {
  id: string
  status: string
  phase?: string
  progress?: number
  created_at?: string
  updated_at?: string
  result?: any
  error?: any
}

type State = {
  datasetId: string | null
  setDatasetId: (id: string | null) => void
  job: Job | null
  setJob: (job: Job | null) => void
}

export const useAppStore = create<State>((set) => ({
  datasetId: null,
  setDatasetId: (datasetId) => set({ datasetId }),
  job: null,
  setJob: (job) => set({ job }),
}))

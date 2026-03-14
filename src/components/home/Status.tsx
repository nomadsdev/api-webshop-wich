"use client"

import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/lib/axios'

interface StatusItem {
    _id: string
    title: string
    subtitle: string
    count: string
    unit: string
    order: number
}

export default function Status() {
    const [statuses, setStatuses] = useState<StatusItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchStatuses()
    }, [])

    const fetchStatuses = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await api.get('/status')
            
            if (response.data.success) {
                setStatuses(response.data.data)
            } else {
                setError(response.data.message || 'ไม่สามารถโหลดข้อมูลสถิติได้')
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
        } finally {
            setLoading(false)
        }
    }

    const renderStatusCard = (status: StatusItem, index: number) => (
        <div key={status._id} className='border rounded-md p-3'>
            <div>
                <h4 className='text-lg font-medium'>
                    {status.title}
                </h4>
                <p className='gg text-xs text-muted-foreground -mt-1'>
                    {status.subtitle}
                </p>
            </div>
            <div className='mt-1 flex items-end space-x-2'>
                <h3 className='font-semibold gg text-4xl'>
                    {status.count}
                </h3>
                <p className='text-muted-foreground'>
                    {status.unit}
                </p>
            </div>
        </div>
    )

    const renderSkeletonCard = (index: number) => (
        <div key={index} className='border rounded-md p-3'>
            <div className='space-y-2'>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <div className='mt-3 flex items-end space-x-2'>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-8" />
            </div>
        </div>
    )

    const renderEmptyCard = (index: number) => (
        <div key={index} className='border rounded-md p-3 opacity-50'>
            <div>
                <h4 className='text-lg font-medium text-muted-foreground'>
                    ไม่มีข้อมูล
                </h4>
                <p className='gg text-xs text-muted-foreground -mt-1'>
                    No Data
                </p>
            </div>
            <div className='mt-1 flex items-end space-x-2'>
                <h3 className='font-semibold gg text-4xl text-muted-foreground'>
                    -
                </h3>
                <p className='text-muted-foreground'>
                    -
                </p>
            </div>
        </div>
    )

    return (
        <section className='flex justify-center px-3 pt-5'>
            <div className='w-full max-w-5xl'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
                    {loading ? (
                        // แสดง skeleton ขณะโหลด
                        Array.from({ length: 4 }).map((_, index) => renderSkeletonCard(index))
                    ) : error ? (
                        // แสดง error message
                        <div className='col-span-full text-center py-8'>
                            <p className='text-muted-foreground'>{error}</p>
                        </div>
                    ) : (
                        // แสดงข้อมูลจริง
                        <>
                            {statuses.map((status, index) => renderStatusCard(status, index))}
                            {/* แสดง empty cards ถ้ามีน้อยกว่า 4 อัน */}
                            {Array.from({ length: Math.max(0, 4 - statuses.length) }).map((_, index) =>
                                renderEmptyCard(statuses.length + index)
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    )
}